import {
  type ReadableSignal,
  type Accessor,
  type WritableSignal,
  type DeferredScope,
  signal,
  effect,
  deferScope,
  startScope,
  stopScope,
  getContext,
  unsafeRun,
  untracked,
  atIndex,
  batch
} from 'kida'
import type {
  Child,
  EmptyValue
} from '../types/index.js'
import {
  deferScopeBindContext,
  effectScopeSwapper
} from '../effects.js'
import { isEmpty } from '../utils.js'
import { createTextNode } from '../elements/text.js'
import {
  insertChildBeforeAnchor,
  remove,
  removeBetween
} from '../elements/child.js'

interface LoopItem {
  k: unknown
  i: WritableSignal<number>
  f: ChildNode | EmptyValue
  l: ChildNode | EmptyValue
  n: LoopItem | undefined
  p: LoopItem | undefined
  d: DeferredScope
}

interface LoopItemsList {
  f: LoopItem | undefined
  s: boolean
}

type LookupMap = Map<unknown, LoopItem>

type AnyEach = (
  item: Accessor<unknown>,
  index: ReadableSignal<number>
) => Child

type UnknownTrack = (item: unknown, index: number) => unknown

function getAnchor(
  item: LoopItem | undefined,
  fallback: ChildNode
) {
  return item?.f ?? fallback
}

function link(
  itemsList: LoopItemsList,
  prev: LoopItem | undefined,
  next: LoopItem | undefined,
  insert?: LoopItem
): void {
  if (prev === undefined) {
    itemsList.f = insert ?? next
  } else {
    prev.n = insert ?? next
  }

  if (next !== undefined) {
    next.p = insert ?? prev
  }
}

function move(
  item: LoopItem,
  anchorItem: LoopItem | undefined,
  fallback: ChildNode
) {
  if (!isEmpty(item.f)) {
    const anchor = getAnchor(anchorItem, fallback)
    const nextStart = item.l!.nextSibling!
    let node = item.f

    while (node !== nextStart) {
      const next = node.nextSibling!

      anchor.before(node)

      node = next
    }
  }
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
  let seen: Set<LoopItem> | undefined
  let matched: LoopItem[] = []
  let stashed: LoopItem[] = []
  let prev: LoopItem | undefined
  let current = itemsList.f

  for (let i = 0, value: unknown, key: unknown, item: LoopItem | undefined; i < length; i += 1) {
    value = nextItems[i]
    key = track(value, i)
    item = lookupMap.get(key)

    if (item === undefined) {
      item = createEachBlock($items, each_, key, i, getAnchor(current, anchor))
      item.p = prev
      item.n = prev === undefined ? itemsList.f : prev.n

      lookupMap.set(key, item)

      link(
        itemsList,
        prev,
        item.n,
        item
      )

      matched = []
      stashed = []

      prev = item
      current = item.n
      continue
    }

    item.i(i)

    if (item !== current) {
      if (seen !== undefined && seen.has(item)) {
        if (matched.length < stashed.length) {
          const [start] = stashed
          let j

          prev = start.p

          const [a] = matched
          const b = matched[matched.length - 1]

          for (j = 0; j < matched.length; j += 1) {
            move(matched[j], start, anchor)
          }

          for (j = 0; j < stashed.length; j += 1) {
            seen.delete(stashed[j])
          }

          link(itemsList, a.p, b.n)
          link(itemsList, prev, a)
          link(itemsList, b, start)

          current = start
          prev = b
          i -= 1

          matched = []
          stashed = []
        } else {
          seen.delete(item)
          move(item, current, anchor)

          link(itemsList, item.p, item.n)
          link(itemsList, item, prev === undefined ? itemsList.f : prev.n)
          link(itemsList, prev, item)

          prev = item
        }

        continue
      }

      matched = []
      stashed = []

      while (current !== undefined && current.k !== key) {
        (seen ??= new Set()).add(current)
        stashed.push(current)
        current = current.n
      }

      if (current === undefined) {
        continue
      }

      item = current
    }

    matched.push(item)
    prev = item
    current = item.n
  }

  if (current !== undefined || seen !== undefined) {
    if (seen !== undefined) {
      seen.forEach(block => destroyLoopItem(itemsList, block, lookupMap))
    }

    while (current !== undefined) {
      prev = current
      current = current.n
      destroyLoopItem(itemsList, prev, lookupMap)
    }
  }
}

function destroyLoopItem(itemsList: LoopItemsList, item: LoopItem, lookupMap: LookupMap) {
  stopScope(item.d)

  if (!isEmpty(item.f)) {
    remove(item.f, item.l!)
  }

  lookupMap.delete(item.k)
  link(itemsList, item.p, item.n)
}

function createEachBlock(
  $items: Accessor<unknown[]>,
  each_: AnyEach,
  key: unknown,
  i: number,
  anchor: ChildNode
): LoopItem {
  const $index = signal(i)
  const item = {
    k: key,
    i: $index,
    f: undefined,
    l: undefined,
    n: undefined,
    p: undefined,
    d: undefined as DeferredScope | undefined
  }

  item.d = deferScope(() => insertChildBeforeAnchor(
    each_(atIndex($items, $index), $index),
    anchor,
    item
  ))

  return item as LoopItem
}

export function loop(
  $items: Accessor<unknown[]>,
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
    f: undefined,
    s: false
  }
  // The loop owns its rows: they are started and stopped
  // in the itemsList order, which mirrors the visual order.
  // The start is deferred with the period (effect(ownRows)), the teardown
  // is held by an eager effect (effect(holdRows, true)) so it exists even
  // when the period is stopped before it ever started
  const startRows = () => {
    itemsList.s = true

    for (let item = itemsList.f; item !== undefined; item = item.n) {
      startScope(item.d)
    }
  }
  const stopRows = () => {
    itemsList.s = false

    for (let item = itemsList.f; item !== undefined; item = item.n) {
      stopScope(item.d)
    }

    blocksMap.clear()
    itemsList.f = undefined
  }
  const ownRows = () => {
    untracked(startRows)
  }
  const holdRows = () => stopRows
  // Clear the previous period DOM; its rows are already stopped -
  // stopping the period destroyed holdRows, whose teardown ran stopRows
  const resetPeriod = (destroyPrev?: DeferredScope) => {
    if (destroyPrev !== undefined) {
      removeBetween(start, end)
    }
  }
  let isPlaceholder = false

  fragment.append(start, end)

  effectScopeSwapper($items, (
    destroyPrev: DeferredScope | undefined,
    items: unknown[]
  ) => {
    const itemsCount = items.length

    if (itemsCount && destroyPrev !== undefined && !isPlaceholder) {
      // [...m] -> [...n]
      // reconcile within the persistent period under the loop context;
      // the context is restored before the trailing flush of the batch
      batch(() => unsafeRun(
        context,
        reconcile,
        itemsList,
        blocksMap,
        $items,
        each_,
        track,
        end,
        items
      ))

      if (itemsList.s) {
        // Rows created by the reconcile start only now, after the removed
        // rows were destroyed; startScope is a no-op on the started ones
        for (let item = itemsList.f; item !== undefined; item = item.n) {
          startScope(item.d)
        }
      }

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
          resetPeriod(destroyPrev)
          effect(holdRows, true)
          effect(ownRows)
          reconcile(
            itemsList,
            blocksMap,
            $items,
            each_,
            track,
            end,
            items
          )
        }
        : () => {
          resetPeriod(destroyPrev)
          insertChildBeforeAnchor(else_?.(), end)
        },
      destroyPrev
    )
  })

  return fragment
}
