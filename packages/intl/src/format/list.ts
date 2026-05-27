import type { Format } from './types.js'
import {
  defaultFormat,
  intlformat
} from './intlformat.js'

/**
 * Creates a list formatter in raw mode.
 * @param options - Pass `false` to return the input value without formatting.
 * @returns Formatter that returns the input value or `undefined`.
 */
export function list(
  options: false
): Format<Iterable<string> | undefined>

/**
 * Creates a locale-aware list formatter.
 * @param options - `Intl.ListFormat` options.
 * @returns Formatter that returns a formatted string or `undefined`.
 */
export function list(
  options?: Intl.ListFormatOptions
): Format<Iterable<string> | undefined, string | undefined>

/**
 * Creates a list formatter in raw mode with a fallback value.
 * @param fallback - Value returned when the input is `undefined` or `null`.
 * @param options - Pass `false` to return the input value or fallback without formatting.
 * @returns Formatter that returns the input value or fallback.
 */
export function list(
  fallback: Iterable<string>,
  options: false
): Format<Iterable<string> | undefined, Iterable<string>>

/**
 * Creates a locale-aware list formatter with a fallback value.
 * @param fallback - Value used when the input is `undefined` or `null`.
 * @param options - `Intl.ListFormat` options.
 * @returns Formatter that returns a formatted string or `undefined`.
 */
export function list(
  fallback: Iterable<string>,
  options?: Intl.ListFormatOptions
): Format<Iterable<string> | undefined, string | undefined>

/* @__NO_SIDE_EFFECTS__ */
export function list(
  optionsOrFallback?: Intl.ListFormatOptions | false | Iterable<string>,
  maybeOptions?: Intl.ListFormatOptions | false
) {
  return intlformat<Intl.ListFormat, Iterable<string>, Intl.ListFormatOptions>(
    Intl.ListFormat,
    defaultFormat,
    optionsOrFallback,
    maybeOptions
  )
}
