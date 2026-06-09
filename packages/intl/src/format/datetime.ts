import type { Format } from './types.js'
import {
  type IntlFormatFn,
  intlformat
} from './intlformat.js'

function datetimeFormat(
  fmt: Intl.DateTimeFormat,
  value: Date | number | string
) {
  return fmt.format(typeof value === 'string' ? new Date(value) : value)
}

/**
 * Creates a date/time formatter in raw mode.
 * @param options - Pass `false` to return the input value without formatting.
 * @returns Formatter that returns the input value or `undefined`.
 */
export function datetime(
  options: false
): Format<Date | number | string | undefined>

/**
 * Creates a locale-aware date/time formatter.
 * @param options - `Intl.DateTimeFormat` options.
 * @returns Formatter that returns a formatted string or `undefined`.
 */
export function datetime(
  options?: Intl.DateTimeFormatOptions
): Format<Date | number | string | undefined, string | undefined>

/**
 * Creates a date/time formatter in raw mode with a fallback value.
 * @param fallback - Value returned when the input is `undefined` or `null`.
 * @param options - Pass `false` to return the input value or fallback without formatting.
 * @returns Formatter that returns the input value or fallback.
 */
export function datetime(
  fallback: Date | number | string,
  options: false
): Format<Date | number | string | undefined, Date | number | string>

/**
 * Creates a locale-aware date/time formatter with a fallback value.
 * @param fallback - Value used when the input is `undefined` or `null`.
 * @param options - `Intl.DateTimeFormat` options.
 * @returns Formatter that returns a formatted string or `undefined`.
 */
export function datetime(
  fallback: Date | number | string,
  options?: Intl.DateTimeFormatOptions
): Format<Date | number | string | undefined, string | undefined>

/**
 * Creates a locale-aware date/time formatter with a custom formatting function.
 * @param optionsOrFallback - `Intl.DateTimeFormat` options, `false`, or fallback value.
 * @param maybeOptions - `Intl.DateTimeFormat` options or `false` when fallback is provided.
 * @param format - Custom formatting function.
 * @returns Formatter that returns a formatted string or `undefined`.
 */
export function datetime<I = Date | number | string>(
  optionsOrFallback?: Intl.DateTimeFormatOptions | false | I,
  maybeOptions?: Intl.DateTimeFormatOptions | false,
  format?: IntlFormatFn<Intl.DateTimeFormat, I, Intl.DateTimeFormatOptions>
): Format<I | undefined, string | undefined>

/* @__NO_SIDE_EFFECTS__ */
export function datetime(
  optionsOrFallback?: Intl.DateTimeFormatOptions | false | Date | number | string,
  maybeOptions?: Intl.DateTimeFormatOptions | false,
  format: IntlFormatFn<Intl.DateTimeFormat, Date | number | string, Intl.DateTimeFormatOptions> = datetimeFormat
) {
  return intlformat(
    Intl.DateTimeFormat,
    format,
    optionsOrFallback,
    maybeOptions
  )
}
