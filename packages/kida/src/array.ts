import type {
  WritableSignal,
  ReadableSignal,
  Accessor
} from 'agera'
import {
  child,
  assignIndex
} from './internals/index.js'

/**
 * Get writable item signal at index from the array signal.
 * @param $array - The array signal.
 * @param index - The index to get.
 * @returns The writable item signal at the index.
 */
export function atIndex<T>(
  $array: WritableSignal<T[]>,
  index: number | Accessor<number>
): WritableSignal<T | undefined>

/**
 * Get readable item signal at index from the array signal.
 * @param $array - The array signal.
 * @param index - The index to get.
 * @returns The readable item signal at the index.
 */
export function atIndex<T>(
  $array: Accessor<T[]>,
  index: number | Accessor<number>
): ReadableSignal<T | undefined>

/* @__NO_SIDE_EFFECTS__ */
export function atIndex<T>(
  $array: Accessor<T[]> | WritableSignal<T[]>,
  index: number | Accessor<number>
) {
  return child($array, index, assignIndex)
}

/**
 * Update the value of the array signal.
 * @param $array - The array signal.
 * @param fn - Function to update the array.
 * @returns The result of the function.
 */
export function updateArray<T, R>($array: WritableSignal<T[]>, fn: (state: T[]) => R): R {
  let result

  $array((state) => {
    const nextState = state.slice()

    result = fn(nextState)

    return nextState
  })

  return result as R
}

/**
 * Add values to the array signal.
 * @param $array - The array signal.
 * @param values - Values to push.
 * @returns The new length of the array.
 */
export function push<T>($array: WritableSignal<T[]>, ...values: T[]) {
  return updateArray($array, state => state.push(...values))
}

/**
 * Removes the last element from an array signal and returns it.
 * @param $array - The array signal.
 * @returns Removed element.
 */
export function pop<T>($array: WritableSignal<T[]>) {
  return updateArray($array, state => state.pop())
}

/**
 * Removes the first element from an array signal and returns it.
 * @param $array - The array signal.
 * @returns Removed element.
 */
export function shift<T>($array: WritableSignal<T[]>) {
  return updateArray($array, state => state.shift())
}

/**
 * Inserts new elements at the start of an array signal, and returns the new length of the array.
 * @param $array - The array signal.
 * @param values - Values to insert.
 * @returns The new length of the array.
 */
export function unshift<T>($array: WritableSignal<T[]>, ...values: T[]) {
  return updateArray($array, state => state.unshift(...values))
}

/**
 * Set value at index in the array signal.
 * @param $array - The array signal.
 * @param index - The index to set.
 * @param value - The value to set.
 * @returns The new value.
 */
export function setIndex<T>($array: WritableSignal<T[]>, index: number, value: T) {
  return updateArray($array, state => state[index] = value)
}

/**
 * Delete element at index from the array signal.
 * @param $array - The array signal.
 * @param index - The index to delete.
 * @returns The removed value.
 */
export function deleteIndex<T>($array: WritableSignal<T[]>, index: number): T | undefined {
  return updateArray($array, state => state.splice(index, 1)[0])
}
