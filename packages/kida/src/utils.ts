import {
  type Accessor,
  type MaybeDestroy,
  computed,
  untracked
} from 'agera'
import type {
  AnyFn,
  ValueOrAccessor
} from './types.js'
import { $get } from './internals/utils.js'

export * from './internals/utils.js'

/**
 * Define an action to escape tracking within a function.
 * @param fn - Function to wrap as an action.
 * @returns The action function.
 */
/* @__NO_SIDE_EFFECTS__ */
export function action<T extends AnyFn>(fn: T): T {
  // oxlint-disable-next-line typescript/no-unsafe-return
  return ((...args: unknown[]) => untracked(() => fn(...args))) as T
}

/**
 * Create a signal for the length property of an object.
 * @param $signal - Store to get the length from.
 * @returns The mapped signal for the length.
 */
/* @__NO_SIDE_EFFECTS__ */
export function length<T extends { length: number }>($signal: Accessor<T>) {
  return computed(() => $signal().length)
}

/**
 * Create a signal for the boolean value of a signal.
 * @param $signal - Store to convert to a boolean.
 * @returns The mapped signal for the boolean value.
 */
/* @__NO_SIDE_EFFECTS__ */
export function boolean<T>($signal: Accessor<T>) {
  return computed(() => Boolean($signal()))
}

/**
 * Concatenate multiple values or accessors into a single string.
 * @param parts - Values or accessors to concatenate.
 * @returns A computed signal that returns the concatenated string.
 */
/* @__NO_SIDE_EFFECTS__ */
export function concat(...parts: ValueOrAccessor<unknown>[]) {
  return computed(() => parts.map($get).join(''))
}

/**
 * Compose multiple destroy functions into a single destroy function.
 * @param destroys - Destroy functions to compose.
 * @returns A single destroy function that calls all provided destroy functions.
 */
export function composeDestroys(...destroys: MaybeDestroy[]) {
  return () => {
    for (let i = 0, len = destroys.length; i < len; i++) {
      destroys[i]?.()
    }
  }
}
