import type { Format } from './types.js'
import {
  defaultFormat,
  intlformat
} from './intlformat.js'

export type Duration = Partial<Record<Intl.DurationFormatUnit, number>>

/**
 * Creates a duration formatter in raw mode.
 * @param options - Pass `false` to return the input value without formatting.
 * @returns Formatter that returns the input value or `undefined`.
 */
export function duration(
  options: false
): Format<Duration | undefined>

/**
 * Creates a locale-aware duration formatter.
 * @param options - `Intl.DurationFormat` options.
 * @returns Formatter that returns a formatted string or `undefined`.
 */
export function duration(
  options?: Intl.DurationFormatOptions
): Format<Duration | undefined, string | undefined>

/**
 * Creates a duration formatter in raw mode with a fallback value.
 * @param fallback - Value returned when the input is `undefined` or `null`.
 * @param options - Pass `false` to return the input value or fallback without formatting.
 * @returns Formatter that returns the input value or fallback.
 */
export function duration(
  fallback: Duration,
  options: false
): Format<Duration | undefined, Duration>

/**
 * Creates a locale-aware duration formatter with a fallback value.
 * @param fallback - Value used when the input is `undefined` or `null`.
 * @param options - `Intl.DurationFormat` options.
 * @returns Formatter that returns a formatted string or `undefined`.
 */
export function duration(
  fallback: Duration,
  options?: Intl.DurationFormatOptions
): Format<Duration | undefined, string | undefined>

/* @__NO_SIDE_EFFECTS__ */
export function duration(
  optionsOrFallback?: Intl.DurationFormatOptions | false | Duration,
  maybeOptions?: Intl.DurationFormatOptions | false
) {
  return intlformat<Intl.DurationFormat, Duration, Intl.DurationFormatOptions>(
    Intl.DurationFormat,
    defaultFormat,
    optionsOrFallback,
    maybeOptions
  )
}
