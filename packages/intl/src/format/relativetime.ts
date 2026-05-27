import type { Format } from './types.js'
import { intlformat } from './intlformat.js'

export type RelativeTimeOptions = Intl.RelativeTimeFormatOptions & {
  unit: Intl.RelativeTimeFormatUnit
}

function relativeTimeFormat(
  fmt: Intl.RelativeTimeFormat,
  value: number,
  options: RelativeTimeOptions | undefined
) {
  return fmt.format(value, options!.unit)
}

/**
 * Creates a relative time formatter in raw mode.
 * @param options - Pass `false` to return the input value without formatting.
 * @returns Formatter that returns the input value or `undefined`.
 */
export function relativetime(
  options: false
): Format<number | undefined>

/**
 * Creates a locale-aware relative time formatter.
 * @param options - `Intl.RelativeTimeFormat` options with a required `unit`.
 * @returns Formatter that returns a formatted string or `undefined`.
 */
export function relativetime(
  options?: RelativeTimeOptions
): Format<number | undefined, string | undefined>

/**
 * Creates a relative time formatter in raw mode with a fallback value.
 * @param fallback - Value returned when the input is `undefined` or `null`.
 * @param options - Pass `false` to return the input value or fallback without formatting.
 * @returns Formatter that returns the input value or fallback.
 */
export function relativetime(
  fallback: number,
  options: false
): Format<number | undefined, number>

/**
 * Creates a locale-aware relative time formatter with a fallback value.
 * @param fallback - Value used when the input is `undefined` or `null`.
 * @param options - `Intl.RelativeTimeFormat` options with a required `unit`.
 * @returns Formatter that returns a formatted string or `undefined`.
 */
export function relativetime(
  fallback: number,
  options?: RelativeTimeOptions
): Format<number | undefined, string | undefined>

/* @__NO_SIDE_EFFECTS__ */
export function relativetime(
  optionsOrFallback?: RelativeTimeOptions | false | number,
  maybeOptions?: RelativeTimeOptions | false
) {
  return intlformat(
    Intl.RelativeTimeFormat,
    relativeTimeFormat,
    optionsOrFallback,
    maybeOptions
  )
}
