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
export function trackBy<T extends string>(key: T) {
  return (item: { [K in T]: unknown }) => item[key]
}

/**
 * Tracker function for an item in a list by its id
 * @param item - The item to track
 * @param item.id - The id of the item
 * @returns The id of the item
 */
export function trackById(item: { id: unknown }) {
  return item.id
}

type AnyEach = (
  item: Accessor<unknown>,
  index: ReadableSignal<number>
) => Child

type ReadableEach<T> = (
  item: Accessor<T>,
  index: ReadableSignal<number>
) => Child

type WritableEach<T> = (
  item: WritableSignal<T>,
  index: ReadableSignal<number>
) => Child

type StaticEach<T> = (
  item: T,
  index: number
) => Child

type UnknownTrack = (item: unknown, index: number) => unknown

// A signal is invariant, so the nullable array is a separate arm rather than
// a widening of the first: `WritableSignal<T[]>` does not fit
// `WritableSignal<T[] | EmptyValue>`, and widening would take the rows of
// every existing caller down to read-only
export function for_<T>(
  $items: WritableSignal<T[]> | WritableSignal<T[] | EmptyValue>,
  track?: (item: T, index: number) => unknown
): (
  each_: WritableEach<T>,
  else_?: () => Child
) => Child

export function for_<T>(
  $items: Accessor<T[] | EmptyValue>,
  track?: (item: T, index: number) => unknown
): (
  each_: ReadableEach<T>,
  else_?: () => Child
) => Child

export function for_<T>(
  $items: T[] | EmptyValue
): (
  each_: StaticEach<T>,
  else_?: () => Child
) => Child

/**
 * Iterate over items and render each item
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
  ) => ($items?.length ? fragment(...$items.map(each_)) : else_?.())
}
