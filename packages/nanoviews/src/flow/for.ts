import {
  type Accessor,
  type ReadableSignal,
  type WritableSignal,
  type EmptyValue,
  isAccessor
} from 'kida'
import {
  type Child,
  loop,
  fragment
} from '../internals/index.js'

/**
 * Create a tracker function for an item in a list
 * @param key - The key to track the item by
 * @returns A function that returns the value of the key in the item
 */
export function trackBy<K extends string>(key: K) {
  return <T>(item: { [P in K]: T }) => item[key]
}

/**
 * Tracker function for an item in a list by its id
 * @param item - The item to track
 * @param item.id - The id of the item
 * @returns The id of the item
 */
export function trackById<T>(item: { id: T }) {
  return item.id
}

/**
 * Hand the row through a transform before rendering it
 * @param as - Function that transforms the row, eg `record`
 * @param each_ - Function that renders the transformed row
 * @returns Function to pass to `for_`
 */
/* @__NO_SIDE_EFFECTS__ */
export function as_<Item, Index, Key, Value>(
  as: (item: Item) => Value,
  each_: (value: Value, index: Index, key: Key) => Child
) {
  return (item: Item, index: Index, key: Key) => each_(as(item), index, key)
}

// The key comes third because it is the one thing about a row that never
// changes: the row is the row the tracker named, and a different key is a
// different row. Without a tracker the key is the position, which is what
// the row is identified by then, so it and the index signal never disagree
type AnyEach = (
  item: Accessor<unknown>,
  index: ReadableSignal<number>,
  key: unknown
) => Child

type ReadableEach<T, K> = (
  item: Accessor<T>,
  index: ReadableSignal<number>,
  key: K
) => Child

type WritableEach<T, K> = (
  item: WritableSignal<T>,
  index: ReadableSignal<number>,
  key: K
) => Child

type StaticEach<T> = (
  item: T,
  index: number,
  key: number
) => Child

type UnknownTrack = (item: unknown, index: number) => unknown

// A signal is invariant, so the nullable array is a separate arm rather than
// a widening of the first: `WritableSignal<T[]>` does not fit
// `WritableSignal<T[] | EmptyValue>`, and widening would take the rows of
// every existing caller down to read-only
export function for_<T, K = number>(
  $items: WritableSignal<T[]> | WritableSignal<T[] | EmptyValue>,
  track?: (item: T, index: number) => K
): (
  each_: WritableEach<T, K>,
  else_?: () => Child
) => Child

export function for_<T, K = number>(
  $items: Accessor<T[] | EmptyValue>,
  track?: (item: T, index: number) => K
): (
  each_: ReadableEach<T, K>,
  else_?: () => Child
) => Child

export function for_<T>(
  $items: T[] | EmptyValue
): (
  each_: StaticEach<T>,
  else_?: () => Child
) => Child

/**
 * Iterate over items and render each item.
 *
 * The render function is given the row, its index signal and the key the
 * tracker named it by - a plain value, because a row keeps its key for as
 * long as it lives.
 * @param $items - Target items
 * @param track - Tracker function to identify items
 * @returns Function to receive each_ and else_ functions
 */
export function for_(
  $items: unknown[] | EmptyValue | Accessor<unknown[] | EmptyValue>,
  track?: UnknownTrack
) {
  if (isAccessor($items)) {
    return (
      each_: AnyEach,
      else_?: () => Child
    ) => loop($items, each_, else_, track)
  }

  return (
    each_: StaticEach<unknown>,
    else_?: () => Child
  ) => (
    $items?.length
      ? fragment(...$items.map((item, index) => each_(item, index, index)))
      : else_?.()
  )
}
