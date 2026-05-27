import type { Format } from './types.js'
import {
  type IntlFormatFn,
  defaultFormat,
  intlformat
} from './intlformat.js'

/**
 * Creates a number formatter in raw mode.
 * @param options - Pass `false` to return the input value without formatting.
 * @returns Formatter that returns the input value or `undefined`.
 */
export function number(
  options: false
): Format<number | bigint | string | undefined>

/**
 * Creates a locale-aware number formatter.
 * @param options - `Intl.NumberFormat` options.
 * @returns Formatter that returns a formatted string or `undefined`.
 */
export function number(
  options?: Intl.NumberFormatOptions
): Format<number | bigint | string | undefined, string | undefined>

/**
 * Creates a number formatter in raw mode with a fallback value.
 * @param fallback - Value returned when the input is `undefined` or `null`.
 * @param options - Pass `false` to return the input value or fallback without formatting.
 * @returns Formatter that returns the input value or fallback.
 */
export function number(
  fallback: number | bigint | string,
  options: false
): Format<number | bigint | string | undefined, number | bigint | string>

/**
 * Creates a locale-aware number formatter with a fallback value.
 * @param fallback - Value used when the input is `undefined` or `null`.
 * @param options - `Intl.NumberFormat` options.
 * @returns Formatter that returns a formatted string or `undefined`.
 */
export function number(
  fallback: number | bigint | string,
  options?: Intl.NumberFormatOptions
): Format<number | bigint | string | undefined, string | undefined>

/**
 * Creates a locale-aware number formatter with a custom formatting function.
 * @param optionsOrFallback - `Intl.NumberFormat` options, `false`, or fallback value.
 * @param maybeOptions - `Intl.NumberFormat` options or `false` when fallback is provided.
 * @param format - Custom formatting function.
 * @returns Formatter that returns a formatted string or `undefined`.
 */
export function number(
  optionsOrFallback?: Intl.NumberFormatOptions | false | number | bigint | string,
  maybeOptions?: Intl.NumberFormatOptions | false,
  format?: IntlFormatFn<Intl.NumberFormat, number | bigint | string, Intl.NumberFormatOptions>
): Format<number | bigint | string | undefined, string | undefined>

/* @__NO_SIDE_EFFECTS__ */
export function number(
  optionsOrFallback?: Intl.NumberFormatOptions | false | number | bigint | string,
  maybeOptions?: Intl.NumberFormatOptions | false,
  format: IntlFormatFn<Intl.NumberFormat, number | bigint | string, Intl.NumberFormatOptions> = defaultFormat
) {
  return intlformat<Intl.NumberFormat, number | bigint | string, Intl.NumberFormatOptions>(
    Intl.NumberFormat,
    format,
    optionsOrFallback,
    maybeOptions
  )
}
