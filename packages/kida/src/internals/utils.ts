import {
  signal,
  isSignal,
  isAccessor,
  computed,
  untracked
} from 'agera'
import type {
  AnyObject,
  EmptyValue,
  PickNonEmptyValue,
  ToAccessor,
  ToSignal,
  ToAccessorOrSignal,
  Signalish
} from './types.js'

/**
 * Set value by index
 * @param array
 * @param index
 * @param value
 * @returns Array copy with value set
 */
export function assignIndex<T>(
  array: T[],
  index: number,
  value: T
) {
  const copy = array.slice()

  copy[index] = value

  return copy
}

/**
 * Assign key to object
 * @param object
 * @param key
 * @param value
 * @returns Object with key assigned
 */
export function assignKey<
  T extends AnyObject,
  K extends PropertyKey,
  V
>(
  object: T | EmptyValue,
  key: K,
  value: V
) {
  return (
    object?.[key] === value
      ? object
      : {
        ...object,
        [key]: value
      }
  ) as PickNonEmptyValue<T> & Record<K, V>
}

/**
 * Get value from signal or return value with tracking
 * @param source - Value or signal
 * @returns Value
 */
export function $get<T>(source: Signalish<T>): T {
  return isAccessor(source) ? source() : source
}

/**
 * Get value from signal or return value without tracking
 * @param source - Value or signal
 * @returns Value
 */
/* @__NO_SIDE_EFFECTS__ */
export function get<T>(source: Signalish<T>): T {
  return untracked(() => $get(source))
}

/**
 * Create signal from value or return signal
 * @param source - Value or signal
 * @returns Writable signal
 */
export function toSignal<T>(
  source: T
): ToSignal<T>

/* @__NO_SIDE_EFFECTS__ */
export function toSignal(source: unknown) {
  return isSignal(source)
    ? source
    : isAccessor(source)
      ? computed(source)
      : signal(source)
}

/**
 * Create accessor from value or return accessor
 * @param source - Value or accessor
 * @returns Accessor
 */
export function toAccessor<T>(
  source: T
): ToAccessor<T>

/* @__NO_SIDE_EFFECTS__ */
export function toAccessor(source: unknown) {
  return isAccessor(source)
    ? source
    : () => source
}

/**
 * Create signal from value or return accessor or signal
 * @param source - Value or accessor or signal
 * @returns Accessor or signal
 */
export function toAccessorOrSignal<T>(
  source: T
): ToAccessorOrSignal<T>

/* @__NO_SIDE_EFFECTS__ */
export function toAccessorOrSignal(source: unknown) {
  return isAccessor(source)
    ? source
    : signal(source)
}

/**
 * Check if value is empty
 * @param value - Value to check
 * @returns True if value is empty
 */
export function isEmpty(value: unknown): value is EmptyValue {
  return value === undefined || value === null
}
