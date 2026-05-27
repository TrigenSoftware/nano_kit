import type { Format } from './types.js'

/**
 * Creates a pass-through formatter.
 * @returns Formatter that returns the input value or `undefined`.
 */
export function raw<T>(): Format<T | undefined>

/**
 * Creates a pass-through formatter with a fallback value.
 * @param fallback - Value returned when the input is `undefined` or `null`.
 * @returns Formatter that returns the input value or fallback.
 */
export function raw<T>(fallback: T): Format<T | undefined, T>

/* @__NO_SIDE_EFFECTS__ */
export function raw<T>(fallback?: T) {
  return (_ctx: unknown, input?: T) => input ?? fallback
}
