import { isFunction } from '@nano_kit/store'
import type {
  FnWithParams,
  Format
} from './types.js'
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

type Transform = (message: string | undefined, locale: string) => string | undefined

/**
 * Applies a text transform to the output of a formatter, or to the text of the message function it returns.
 * @param format - Formatter to transform.
 * @param fn - Text transform.
 * @returns Formatter with transformed output.
 */
/* @__NO_SIDE_EFFECTS__ */
function transform<T>(
  format: Format<T, string | undefined | FnWithParams<unknown>>,
  fn: Transform
): Format<T, string | undefined | FnWithParams<unknown>> {
  return (ctx, input) => {
    const message = format(ctx, input)
    const locale = ctx.$locale()

    return isFunction(message)
      ? params => fn(message(params), locale)
      : fn(message, locale)
  }
}

/**
 * Creates a formatter that uppercases the text of another formatter.
 * @param format - Formatter of a text, or of a message function like `params` or `plural`.
 * @returns Formatter with uppercased output.
 */
export function uppercase<T>(
  format: Format<T, string | undefined>
): Format<T, string | undefined>

export function uppercase<T>(
  format: Format<T, string>
): Format<T, string>

export function uppercase<T, P>(
  format: Format<T, FnWithParams<P>>
): Format<T, FnWithParams<P>>

/* @__NO_SIDE_EFFECTS__ */
export function uppercase<T>(
  format: Format<T, string | undefined | FnWithParams<unknown>>
): Format<T, string | undefined | FnWithParams<unknown>> {
  return transform(format, (message, locale) => message?.toLocaleUpperCase(locale))
}

/**
 * Creates a formatter that lowercases the text of another formatter.
 * @param format - Formatter of a text, or of a message function like `params` or `plural`.
 * @returns Formatter with lowercased output.
 */
export function lowercase<T>(
  format: Format<T, string | undefined>
): Format<T, string | undefined>

export function lowercase<T>(
  format: Format<T, string>
): Format<T, string>

export function lowercase<T, P>(
  format: Format<T, FnWithParams<P>>
): Format<T, FnWithParams<P>>

/* @__NO_SIDE_EFFECTS__ */
export function lowercase<T>(
  format: Format<T, string | undefined | FnWithParams<unknown>>
): Format<T, string | undefined | FnWithParams<unknown>> {
  return transform(format, (message, locale) => message?.toLocaleLowerCase(locale))
}

/**
 * Creates a formatter that capitalizes the text of another formatter.
 * @param format - Formatter of a text, or of a message function like `params` or `plural`.
 * @returns Formatter with the first character uppercased.
 */
export function capitalize<T>(
  format: Format<T, string | undefined>
): Format<T, string | undefined>

export function capitalize<T>(
  format: Format<T, string>
): Format<T, string>

export function capitalize<T, P>(
  format: Format<T, FnWithParams<P>>
): Format<T, FnWithParams<P>>

/* @__NO_SIDE_EFFECTS__ */
export function capitalize<T>(
  format: Format<T, string | undefined | FnWithParams<unknown>>
): Format<T, string | undefined | FnWithParams<unknown>> {
  return transform(format, (message, locale) => (
    message === undefined
      ? message
      : message.charAt(0).toLocaleUpperCase(locale) + message.slice(1)
  ))
}
