import {
  type WritableSignal,
  type ReadableSignal,
  type Accessor,
  computed,
  atIndex
} from 'kida'

/**
 * Get writable item signal by predicate from the array signal.
 * @param $array - The array signal.
 * @param predicate - Predicate to select the item (same semantics as `Array.prototype.findIndex`).
 * @returns The writable item signal for the first matched item.
 */
export function atFoundIndex<T>(
  $array: WritableSignal<T[]>,
  predicate: (item: T, index: number, array: T[]) => boolean
): WritableSignal<T | undefined>

/**
 * Get readable item signal by predicate from the array signal.
 * @param $array - The array signal.
 * @param predicate - Predicate to select the item (same semantics as `Array.prototype.findIndex`).
 * @returns The readable item signal for the first matched item.
 */
export function atFoundIndex<T>(
  $array: Accessor<T[]>,
  predicate: (item: T, index: number, array: T[]) => boolean
): ReadableSignal<T | undefined>

/* @__NO_SIDE_EFFECTS__ */
export function atFoundIndex<T>(
  $array: Accessor<T[]> | WritableSignal<T[]>,
  predicate: (item: T, index: number, array: T[]) => boolean
): ReadableSignal<T | undefined> {
  return atIndex($array, computed(() => $array().findIndex(predicate)))
}
