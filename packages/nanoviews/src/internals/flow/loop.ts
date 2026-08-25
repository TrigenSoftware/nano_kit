import {
  type ReadableSignal,
  type Accessor,
  type WritableSignal,
  type NewValue,
  type DeferredScope,
  NoneFlag,
  WritableMode,
  signal,
  effect,
  deferScope,
  startScope,
  stopScope,
  getContext,
  unsafeRun,
  untracked,
  createSignal,
  isWritable,
  nextValue,
  assignIndex
} from 'kida'
import type {
  Child,
  EmptyValue
} from '../types/index.js'
import {
  deferScopeBindContext,
  effectScopeSwapper
} from '../effects.js'
import { createTextNode } from '../elements/text.js'
import {
  insertChildBeforeAnchor,
  remove,
  removeBetween
} from '../elements/child.js'

// The list is a chain of items in visual order headed by the list itself, so
// a splice is always the same two writes with no head to special case
interface LoopLink {
  /**
   * Next item.
   */
  n: LoopItem | undefined
}

// The item is the row: the face handed to `each_` is bound to it, so the
// write back into the array finds its place with the key and the tracker
// straight off the item and the value signal keeps the shape `signal` gave it
interface LoopItem extends LoopLink {
  /**
   * Tracking key.
   */
  k: unknown
  /**
   * Index signal.
   */
  i: WritableSignal<number>
  /**
   * Value signal - what the reconcile writes.
   */
  v: WritableSignal<unknown>
  /**
   * The items array.
   */
  a: WritableSignal<unknown[]> | undefined
  /**
   * First and last DOM node of the row.
   */
  f: ChildNode
  l: ChildNode
  /**
   * Previous item.
   */
  p: LoopLink
  /**
   * Deferred scope of the row.
   */
  d: DeferredScope
  /**
   * Writability of the face.
   */
  modes: number
}

interface LoopItemsList extends LoopLink {
  /**
   * First row a reconcile created that still has to be started. Everything
   * it made is at or after this one, so the start walks from here.
   */
  c: LoopItem | undefined
}

type LookupMap = Map<unknown, LoopItem>

type AnyEach = (
  item: Accessor<unknown>,
  index: ReadableSignal<number>,
  key: unknown
) => Child

type UnknownTrack = (item: unknown, index: number) => unknown

// The row owns its value: the reconcile pushes it in, so a write to the
// items array wakes only the rows whose value actually changed. The face in
// front of the item carries the write back to the array, and the raw signal
// under `v` is what the reconcile writes
function rowOper(this: LoopItem, ...value: [NewValue<unknown>]) {
  if (value.length) {
    const $items = this.a

    // A destroyed row keeps no array to write into: its index means nothing
    // any more, and the position it used to name may already belong to a row
    // created after it died
    if ($items !== undefined) {
      let items!: unknown[]
      let index!: number

      untracked(() => {
        items = $items()
        index = this.i()
      })

      $items(assignIndex(items, index, nextValue(items[index], value[0])))
    }
  } else {
    return this.v()
  }
}

function link(prev: LoopLink, next: LoopItem | undefined): void {
  prev.n = next

  if (next !== undefined) {
    next.p = prev
  }
}

// Every row holds at least one node, so the range is never empty
function move(item: LoopItem, anchor: ChildNode) {
  const nextStart = item.l.nextSibling
  let node: ChildNode = item.f

  do {
    const next = node.nextSibling!

    anchor.before(node)

    node = next
  } while (node !== nextStart)
}

// oxlint-disable-next-line eslint/max-params
function reconcile(
  itemsList: LoopItemsList,
  lookupMap: LookupMap,
  $items: Accessor<unknown[]>,
  each_: AnyEach,
  track: UnknownTrack,
  anchor: ChildNode,
  nextItems: unknown[]
) {
  const { length } = nextItems
  // The cursor stands at `prev.n` the whole way: an item is placed by
  // splicing it in there, a skipped one is stashed and stepped over
  let prev: LoopLink = itemsList
  let current = itemsList.n
  let seen: Set<LoopItem> | undefined
  // The stash is the run of `stashed` items at `start`, the matched ones the
  // run of `matched` items at `first` right behind it
  let start!: LoopItem
  let first!: LoopItem
  let stashed = 0
  let matched = 0
  // Rewinding to the stash re-walks it, so the walks stay linear in total
  // only while what they rewind over fits one pass over the list
  let budget = length
  // A read-only items array has nothing to write back to, so its rows are
  // the bare value signal and cost no face - one question for the whole pass
  const writable = isWritable($items)
  // A write to a signal is a reducer when it is a function, so the value the
  // reconcile pushes into a row travels through this slot: a row whose value
  // is a function is stored, not called - and one slot serves the whole pass
  let rawValue: unknown
  const raw = () => rawValue

  for (let i = 0, value: unknown, key: unknown, item: LoopItem | undefined; i < length; i++) {
    value = nextItems[i]
    key = track(value, i)
    item = lookupMap.get(key)

    if (item === undefined) {
      // A row is born here whole: its two signals, the face over the item
      // when the array can take writes back, and the deferred scope whose
      // body renders it and lands its DOM range on the item itself
      const $index = signal(i)
      const $value = signal(value)
      const insertAnchor = current !== undefined ? current.f : anchor
      const row = item = {
        k: key,
        i: $index,
        v: $value,
        a: $items,
        f: undefined,
        l: undefined,
        n: undefined,
        p: undefined,
        d: undefined,
        modes: WritableMode
      } as unknown as LoopItem
      let $row: Accessor<unknown> = $value

      if (writable) {
        $row = createSignal(rowOper, row as never) as Accessor<unknown>
      } else {
        // A read-only items array has nothing to write back to, so the row is
        // the bare value signal - and it must not answer that it is writable,
        // or a child of it would be handed a setter that writes nowhere
        $value.node.modes = NoneFlag
      }

      row.d = deferScope(() => {
        insertChildBeforeAnchor(each_($row, $index, key), insertAnchor, row)

        // Every row holds a place in the DOM, so a row that rendered nothing
        // still has one to be moved to, inserted before and removed with
        if (!row.f) {
          insertAnchor.before(row.f = row.l = createTextNode())
        }
      })

      lookupMap.set(key, item)
      itemsList.c ??= item

      link(item, current)
      link(prev, item)

      matched = stashed = 0
      prev = item
      continue
    }

    if (item.i.node.pendingValue !== i) {
      item.i(i)
    }

    if (item.v.node.pendingValue !== value) {
      rawValue = value
      item.v(raw)
    }

    if (item !== current) {
      if (seen !== undefined && seen.has(item)) {
        // Fewer items were matched than stashed, so carrying the matched run
        // back in front of the stash beats carrying the stash out one by one
        // - as long as re-walking the stash is still within budget
        if (matched < stashed && (budget -= stashed) > 0) {
          const last = prev as LoopItem
          let node = first

          for (let j = stashed, s = start; j--; s = s.n!) {
            seen.delete(s)
          }

          for (let j = matched; j--; node = node.n!) {
            move(node, start.f)
          }

          link(first.p, last.n)
          link(start.p, first)
          link(last, start)

          current = start
          prev = last
          i -= 1
          matched = stashed = 0
          continue
        }

        seen.delete(item)
        move(item, current !== undefined ? current.f : anchor)

        link(item.p, item.n)
        link(item, current)
        link(prev, item)

        prev = item
        continue
      }

      matched = stashed = 0
      start = current!

      while (current !== undefined && current.k !== key) {
        (seen ??= new Set()).add(current)
        stashed++
        current = current.n
      }

      // The key is neither ahead of the cursor nor stashed, so it was placed
      // already: the same key twice in one list. The lookup holds one row per
      // key and cannot place it twice, so the pass walks on with a stash it
      // will not match and throws a step later - a loud failure, and not a
      // list silently rendered one row short
      if (current === undefined) {
        continue
      }

      item = current
    }

    if (seen !== undefined && !matched++) {
      first = item
    }

    prev = item
    current = item.n
  }

  if (seen !== undefined) {
    for (const item of seen) {
      item.a = undefined
      stopScope(item.d)
      remove(item.f, item.l)
      lookupMap.delete(item.k)
      link(item.p, item.n)
    }
  }

  // Whatever the cursor did not reach is a suffix of the list, and the list
  // is the visual order: one splice cuts it off, one crossing deletes it
  if (current !== undefined) {
    const from = current.f

    prev.n = undefined

    do {
      current.a = undefined
      stopScope(current.d)
      lookupMap.delete(current.k)
      current = current.n
    } while (current !== undefined)

    remove(from, anchor.previousSibling!)
  }
}

export function loop(
  $items: Accessor<unknown[] | EmptyValue>,
  each_: AnyEach,
  else_?: () => Child,
  track: UnknownTrack = (_, i) => i
): Child {
  const start = createTextNode()
  const end = createTextNode()
  const context = getContext()
  const periodScope = deferScopeBindContext(context)
  const fragment = document.createDocumentFragment()
  const blocksMap: LookupMap = new Map()
  const itemsList: LoopItemsList = {
    n: undefined,
    c: undefined
  }
  // The loop owns its rows: they are started and stopped in the itemsList
  // order, which mirrors the visual order. The start is an effect of its own
  // over the same array the swap reads, and that second reader is what makes
  // a row's write back into the array land: the write is made while the swap
  // runs, and a running effect cannot be re-queued by its own propagation, so
  // it takes an idle subscriber to settle the array and re-queue the parked
  // swap. Starting from here also keeps the rows a reconcile made off the
  // swap's own stack. The teardown is held by an eager effect in the period
  // body, so it exists even when the period is stopped before it ever started
  const startRows = () => {
    // Only a reconcile that made a row has anything to start, and never
    // anything in front of the first row it made
    for (let item = itemsList.c; item !== undefined; item = item.n) {
      startScope(item.d)
    }

    itemsList.c = undefined
  }
  const stopRows = () => {
    for (let item = itemsList.n; item !== undefined; item = item.n) {
      item.a = undefined
      stopScope(item.d)
    }

    blocksMap.clear()
    itemsList.n = itemsList.c = undefined
  }
  let isPlaceholder = false

  fragment.append(start, end)

  effectScopeSwapper($items, (
    destroyPrev: DeferredScope | undefined,
    items: unknown[] | EmptyValue
  ) => {
    // No array at all is the same emptiness as an empty one: the rows go and
    // the placeholder comes, and nothing below ever reaches into it
    const itemsCount = items?.length

    if (itemsCount && destroyPrev !== undefined && !isPlaceholder) {
      // [...m] -> [...n]
      // Reconcile within the persistent period under the loop context. The
      // swap runs from the flush and from nowhere else, so the writes below
      // are already deferred: a batch here would add nothing but its own
      // trailing flush, and that flush would drain the queue onto the swap's
      // own stack - the one place a write back into the array is lost
      unsafeRun(
        context,
        reconcile,
        itemsList,
        blocksMap,
        $items as Accessor<unknown[]>,
        each_,
        track,
        end,
        items
      )

      return destroyPrev
    }

    if (!itemsCount && isPlaceholder) {
      // [] -> []
      return destroyPrev!
    }

    isPlaceholder = !itemsCount

    // The previous period is destroyed first, while its DOM is still
    // attached; then the body removes it and renders the new content
    return periodScope(
      itemsCount
        ? () => {
          // Clear the previous period DOM; its rows are already stopped -
          // stopping the period destroyed holdRows, whose teardown ran
          // stopRows
          if (destroyPrev !== undefined) {
            removeBetween(start, end)
          }

          effect(() => stopRows, true)
          reconcile(
            itemsList,
            blocksMap,
            $items as Accessor<unknown[]>,
            each_,
            track,
            end,
            items
          )
        }
        : () => {
          if (destroyPrev !== undefined) {
            removeBetween(start, end)
          }

          insertChildBeforeAnchor(else_?.(), end)
        },
      destroyPrev
    )
  })

  // The start effect keeps the loop's own position among the siblings, so
  // the rows still come up before the effects of whatever holds them. It
  // subscribes after the swap on purpose: the array notifies its readers in
  // subscription order, and the rows have to be there before anything starts
  // them
  periodScope(() => effect(() => {
    $items()
    startRows()
  }))

  return fragment
}
