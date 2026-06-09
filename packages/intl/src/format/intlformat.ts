import type { FormatContext } from '../types.js'
import { memo } from '../utils.js'
import type { IntlFormat } from './types.js'
import { raw } from './raw.js'

export type IntlFormatConstructor<F, O> = new (
  locale: string,
  options?: O
) => F

export type IntlFormatFn<F extends IntlFormat<unknown>, I, O> = (
  fmt: F,
  value: I,
  options: O | undefined
) => string

export function defaultFormat<F extends IntlFormat<I>, I>(
  fmt: F,
  value: I
) {
  return fmt.format(value)
}

export function intlformat<
  F extends IntlFormat<unknown>,
  I,
  O
>(
  IntlFormat: IntlFormatConstructor<NoInfer<F>, O>,
  format: IntlFormatFn<F, I, O>,
  optionsOrFallback?: O | false | I,
  maybeOptions?: O | false
) {
  let fallback: I | undefined
  let options: O | false | undefined

  if (maybeOptions !== undefined) {
    fallback = optionsOrFallback as I
    options = maybeOptions
  } else {
    options = optionsOrFallback as O | false | undefined
  }

  const rawFormat = raw(fallback)

  if (options === false) {
    return rawFormat
  }

  const fmt = memo((locale: string) => new IntlFormat(locale, options))

  return (ctx: FormatContext, input?: I) => {
    const value = rawFormat(ctx, input)

    if (value === undefined) {
      return value
    }

    return format(fmt(ctx.$locale()), value, options)
  }
}
