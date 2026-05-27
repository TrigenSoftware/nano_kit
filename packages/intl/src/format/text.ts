import type { Format } from './types.js'
import { raw } from './raw.js'

/**
 * Creates a string formatter.
 * @returns Formatter that returns the input string or `undefined`.
 */
export function text(): Format<string | undefined>

/**
 * Creates a string formatter with a fallback value.
 * @param fallback - String returned when the input is `undefined` or `null`.
 * @returns Formatter that returns the input string or fallback.
 */
export function text(fallback: string): Format<string | undefined, string>

/* @__NO_SIDE_EFFECTS__ */
export function text(fallback?: string): Format<string | undefined> {
  return raw(fallback)
}

/**
 * Creates a formatter that uppercases another text formatter output.
 * @param format - Text formatter to transform.
 * @returns Formatter with uppercased output.
 */
export function uppercase<T>(
  format: Format<T, string | undefined>
): Format<T, string | undefined>

export function uppercase<T>(
  format: Format<T, string>
): Format<T, string>

/* @__NO_SIDE_EFFECTS__ */
export function uppercase<T>(
  format: Format<T, string | undefined>
): Format<T, string | undefined> {
  return (ctx, input) => format(ctx, input)?.toLocaleUpperCase(ctx.$locale())
}

/**
 * Creates a formatter that lowercases another text formatter output.
 * @param format - Text formatter to transform.
 * @returns Formatter with lowercased output.
 */
export function lowercase<T>(
  format: Format<T, string | undefined>
): Format<T, string | undefined>

export function lowercase<T>(
  format: Format<T, string>
): Format<T, string>

/* @__NO_SIDE_EFFECTS__ */
export function lowercase<T>(
  format: Format<T, string | undefined>
): Format<T, string | undefined> {
  return (ctx, input) => format(ctx, input)?.toLocaleLowerCase(ctx.$locale())
}

function toCapitalize(message: string | undefined, locale: string) {
  return message === undefined
    ? message
    : message.charAt(0).toLocaleUpperCase(locale) + message.slice(1)
}

/**
 * Creates a formatter that capitalizes another text formatter output.
 * @param format - Text formatter to transform.
 * @returns Formatter with the first character uppercased.
 */
export function capitalize<T>(
  format: Format<T, string | undefined>
): Format<T, string | undefined>

export function capitalize<T>(
  format: Format<T, string>
): Format<T, string>

/* @__NO_SIDE_EFFECTS__ */
export function capitalize<T>(
  format: Format<T, string | undefined>
): Format<T, string | undefined> {
  return (ctx, input) => toCapitalize(format(ctx, input), ctx.$locale())
}
