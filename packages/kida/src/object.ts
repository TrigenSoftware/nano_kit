/* oxlint-disable typescript/no-unsafe-return */
import type {
  WritableSignal,
  ReadableSignal,
  Accessor
} from 'agera'
import {
  type AnyCollection,
  child,
  assignKey
} from './internals/index.js'

/**
 * Get writable item signal by key from the object signal.
 * @param $object - The object signal.
 * @param key - The key to get.
 * @returns The writable item signal by the key.
 */
export function atKey<T extends AnyCollection>(
  $object: WritableSignal<T>,
  key: keyof T | Accessor<keyof T>
): WritableSignal<T[keyof T]>

/**
 * Get readable item signal by key from the object signal.
 * @param $object - The object signal.
 * @param key - The key to get.
 * @returns The readable item signal by the key.
 */
export function atKey<T extends AnyCollection>(
  $object: Accessor<T>,
  key: keyof T | Accessor<keyof T>
): ReadableSignal<T[keyof T]>

/* @__NO_SIDE_EFFECTS__ */
export function atKey<T extends AnyCollection>(
  $object: Accessor<T> | WritableSignal<T>,
  key: keyof T | Accessor<keyof T>
) {
  return child($object, key, assignKey)
}

/**
 * Set value by key to the object signal.
 * @param $object - The object signal.
 * @param key - The key to set.
 * @param value - The value to set.
 * @returns The value.
 */
export function setKey<T extends AnyCollection>($object: WritableSignal<T>, key: keyof T, value: T[keyof T]) {
  $object(state => assignKey(state, key, value))
  return value
}

/**
 * Delete item by key from the object signal.
 * @param $object - The object signal.
 * @param key - The key to delete.
 * @returns The value.
 */
export function deleteKey<T extends AnyCollection>($object: WritableSignal<T>, key: keyof T) {
  let result

  $object((state) => {
    let nextState

    ;({ [key]: result, ...nextState } = state)

    return nextState as T
  })

  return result as T[keyof T]
}
