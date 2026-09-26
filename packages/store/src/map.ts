import {
  type NewValue,
  type WritableSignal,
  batch,
  computed,
  noop,
  signal,
  uninspected,
  untracked
} from 'kida'
import { signalNodeAssign } from './utils.js'

type Item<V> = WritableSignal<V | undefined>

// What the class keeps of Map: `has`, `keys` and `size` as they are, the rest
// only through `super`. The items are signals, and a signal must not leave the
// map, so whatever would hand one out is left undeclared. Declared only: the
// cast in the heritage clause is all that is left of it at runtime
declare class ItemsMap<K> {
  readonly size: number
  protected get(key: K): unknown
  protected set(key: K, $item: unknown): this
  protected values(): MapIterator<unknown>
  delete(key: K): boolean
  clear(): void
  has(key: K): boolean
  keys(): MapIterator<K>
}

// What the signal of a deleted item is left with: a value no item can hold,
// so the write notifies whatever the item held - `undefined` included, which
// is a value like any other here. Nobody reads it: the signal is out of the
// map by then, and its readers run again to find that out
const gone = {}
// One counter for every map: a version only has to differ from the one its
// signal holds, and the next epoch differs from all of them - with nothing
// to allocate and no reducer to call
let epoch = 0

/**
 * A Map whose values are reactive: every value lives in a signal of its own,
 * and the signals never leave the map.
 */
export class SignalsMap<K, V> extends (Map as unknown as typeof ItemsMap)<K> {
  // The version of the set of keys: moves when a key is added or removed.
  // Shared with the subclass, so it is not private and a minifier leaves its
  // name alone - which is why the name is this short. For the devtools, in
  // development alone, its node carries the map: they tell the map from
  // a signal by it and read its entries
  protected readonly $v = import.meta.env.DEV
    ? signalNodeAssign(signal<number>(), {
      map: this
    })
    : signal<number>()

  /**
   * Get the value by key without tracking it.
   * @param key - The key to get.
   * @returns The value.
   */
  override get(key: K): V | undefined {
    const $item = super.get(key) as Item<V> | undefined

    return $item && untracked($item)
  }

  /**
   * Get the value by key: the running computed or effect runs again when
   * the value changes, and when the key appears or goes.
   * @param key - The key to get.
   * @returns The value.
   */
  $get(key: K): V | undefined {
    const $item = super.get(key) as Item<V> | undefined

    if ($item) {
      return $item()
    }

    // Nothing to read yet: the next change of the set of keys asks again
    this.$v()
  }

  /**
   * Set the value by key.
   * @param key - The key to set.
   * @param value - The value or a reducer of the current one.
   * @returns The map.
   */
  override set(
    key: K,
    value: NewValue<V | undefined>
  ) {
    let $item = super.get(key) as Item<V> | undefined
    const insert = !$item

    if (insert) {
      super.set(key, $item = signal())

      // For the devtools, in development alone: an entry carries its map and
      // its key
      if (import.meta.env.DEV) {
        signalNodeAssign($item, {
          map: this,
          key
        })
      }
    }

    // Nobody reads a signal created a line ago: the write of an insert is
    // silent, and the version is the only one that notifies
    $item!(value)

    if (insert) {
      this.$v(++epoch)
    }

    return this
  }

  /**
   * Delete the value by key.
   * @param key - The key to delete.
   * @returns Whether the key was there.
   */
  override delete(key: K) {
    const $item = super.get(key) as Item<V> | undefined

    if ($item) {
      super.delete(key)
      // The version goes first: a reader of both the keys and the item runs
      // once, and lets the item go before it is written.
      // The item is written all the same: a reader of the key alone holds
      // nothing else, and a key deleted and set again within one batch has
      // no other way to take its readers over to the new signal
      this.$v(++epoch)
      $item(gone as V)
    }

    return !!$item
  }

  /**
   * Delete every value.
   */
  override clear() {
    batch(() => {
      for (const $item of super.values() as MapIterator<Item<V>>) {
        $item(gone as V)
      }

      super.clear()
      this.$v(++epoch)
    })
  }
}

/**
 * A `SignalsMap` that lists its keys and has a lifecycle: `$index` is
 * the list, and every tracked read of the map keeps it mounted.
 */
export class IndexedSignalsMap<K, V> extends SignalsMap<K, V> {
  // Computes nothing, so it never changes. Every tracked read of the map links
  // to it: whoever reads an item keeps the map mounted, and nothing ever walks
  // the links of a node that does not change, which makes holding it free.
  // A computed and not a signal: the index wears this node, and the node of
  // a signal would make `isWritable` say yes about the index. The devtools
  // never see it, in development alone: nobody reads it for what it holds
  readonly #$anchor = import.meta.env.DEV
    ? uninspected(() => computed(noop))
    : computed(noop)

  /**
   * The keys of the map: changes when a key is added or removed, not when
   * a value is set. It stands for the whole map in the lifecycle: mark it
   * `mountable` right after the map is created, and it is mounted by every
   * reader of the map, the readers of `$get` included.
   */
  readonly $index = computed(() => {
    // Read for the link alone: it puts the index under the anchor, so the
    // readers of the index are readers of the map too
    this.#$anchor()
    this.$v()

    // Built on read: a mutation only moves the version, so a batch of them
    // costs one array instead of one per write
    return [...this.keys()]
  })

  constructor() {
    super()

    if (import.meta.env.DEV) {
      // For the devtools, in development alone: the index carries its map,
      // and with no key, so no key of the map is taken for it. Marked while
      // the index still wears its own node
      signalNodeAssign(this.$index, {
        map: this
      })
    }

    // Whatever asks a signal about its lifecycle asks its node, and the
    // lifecycle of the index is the one of the whole map: the index gives its
    // node away for the anchor's. The function stays bound to the computed it
    // was made for, so reading it is what it was.
    // The index is linked under the anchor at its first read, and a computed
    // linked under a node that is not mountable yet does not relay later:
    // this is why the index has to be marked before anybody reads it
    this.$index.node = this.#$anchor.node
  }

  /**
   * Get the value by key and track it, as `SignalsMap` does - and keep the map
   * mounted for as long as the reader lives.
   * @param key - The key to get.
   * @returns The value.
   */
  override $get(key: K): V | undefined {
    this.#$anchor()

    return super.$get(key)
  }
}
