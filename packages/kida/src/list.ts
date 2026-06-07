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
 * Get writable item signal at index from the list signal.
 * @param $list - The list signal.
 * @param index - The index to get.
 * @returns The writable item signal at the index.
 */
export function atIndex<T>(
  $list: WritableSignal<T[]>,
  index: number | Accessor<number>
): WritableSignal<T | undefined>

/**
 * Get readable item signal at index from the list signal.
 * @param $list - The list signal.
 * @param index - The index to get.
 * @returns The readable item signal at the index.
 */
export function atIndex<T>(
  $list: Accessor<T[]>,
  index: number | Accessor<number>
): ReadableSignal<T | undefined>

/* @__NO_SIDE_EFFECTS__ */
export function atIndex<T>(
  $list: Accessor<T[]> | WritableSignal<T[]>,
  index: number | Accessor<number>
) {
  return child($list, index, assignIndex)
}

/**
 * Update the value of the list signal.
 * @param $list - The list signal.
 * @param fn - Function to update the list.
 * @returns The result of the function.
 */
export function updateList<T, R>($list: WritableSignal<T[]>, fn: (state: T[]) => R): R {
  let result

  $list((state) => {
    const nextState = state.slice()

    result = fn(nextState)

    return nextState
  })

  return result as R
}

/**
 * Add values to the list signal.
 * @param $list - The list signal.
 * @param values - Values to push.
 * @returns The new length of the list.
 */
export function push<T>($list: WritableSignal<T[]>, ...values: T[]) {
  return updateList($list, state => state.push(...values))
}

/**
 * Removes the last element from a list signal and returns it.
 * @param $list - The list signal.
 * @returns Removed element.
 */
export function pop<T>($list: WritableSignal<T[]>) {
  return updateList($list, state => state.pop())
}

/**
 * Removes the first element from a list signal and returns it.
 * @param $list - The list signal.
 * @returns Removed element.
 */
export function shift<T>($list: WritableSignal<T[]>) {
  return updateList($list, state => state.shift())
}

/**
 * Inserts new elements at the start of an list signal, and returns the new length of the list.
 * @param $list - The list signal.
 * @param values - Values to insert.
 * @returns The new length of the list.
 */
export function unshift<T>($list: WritableSignal<T[]>, ...values: T[]) {
  return updateList($list, state => state.unshift(...values))
}

/**
 * Set value at index in the list signal.
 * @param $list - The list signal.
 * @param index - The index to set.
 * @param value - The value to set.
 * @returns The new value.
 */
export function setIndex<T>($list: WritableSignal<T[]>, index: number, value: T) {
  return updateList($list, state => state[index] = value)
}

/**
 * Delete element at index from the list signal.
 * @param $list - The list signal.
 * @param index - The index to delete.
 * @returns The removed value.
 */
export function deleteIndex<T>($list: WritableSignal<T[]>, index: number): T | undefined {
  return updateList($list, state => state.splice(index, 1)[0])
}
