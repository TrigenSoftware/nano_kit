import type { IntlFormatFn } from './intlformat.js'
import type {
  Format,
  IntlFormatRange
} from './types.js'

type RangeInput<I> = readonly [from: I, to: I]

type RangeFrom<F extends IntlFormatRange<I>, I, O, R> = (
  optionsOrFallback?: O | false | I,
  maybeOptions?: O | false,
  format?: IntlFormatFn<F, I, O>
) => Format<I | undefined, R | undefined>

function rangeFormat(
  fmt: IntlFormatRange<unknown>,
  [from, to]: RangeInput<unknown>
) {
  return fmt.formatRange(from, to)
}

/**
 * Creates a range formatter in raw mode.
 * @param format - Formatter factory that supports a custom range formatting function.
 * @param options - Pass `false` to return the input range without formatting.
 * @returns Formatter that returns the input range or `undefined`.
 */
export function range<F extends IntlFormatRange<I>, I, O, R>(
  format: RangeFrom<F, I, O, R>,
  options: false
): Format<RangeInput<I> | undefined>

/**
 * Creates a locale-aware range formatter.
 * @param format - Formatter factory that supports a custom range formatting function.
 * @param options - Formatter options.
 * @returns Formatter that returns a formatted range string or `undefined`.
 */
export function range<F extends IntlFormatRange<I>, I, O, R>(
  format: RangeFrom<F, I, O, R>,
  options?: O
): Format<RangeInput<I> | undefined, string | undefined>

/**
 * Creates a range formatter in raw mode with a fallback range.
 * @param format - Formatter factory that supports a custom range formatting function.
 * @param fallback - Range returned when the input is `undefined` or `null`.
 * @param options - Pass `false` to return the input range or fallback without formatting.
 * @returns Formatter that returns the input range or fallback.
 */
export function range<F extends IntlFormatRange<I>, I, O, R>(
  format: RangeFrom<F, I, O, R>,
  fallback: RangeInput<I>,
  options: false
): Format<RangeInput<I> | undefined, RangeInput<I>>

/**
 * Creates a locale-aware range formatter with a fallback range.
 * @param format - Formatter factory that supports a custom range formatting function.
 * @param fallback - Range used when the input is `undefined` or `null`.
 * @param options - Formatter options.
 * @returns Formatter that returns a formatted range string or `undefined`.
 */
export function range<F extends IntlFormatRange<I>, I, O, R>(
  format: RangeFrom<F, I, O, R>,
  fallback: RangeInput<I>,
  options?: O
): Format<RangeInput<I> | undefined, string | undefined>

/* @__NO_SIDE_EFFECTS__ */
export function range<F extends IntlFormatRange<I>, I, O, R>(
  format: RangeFrom<F, I, O, R>,
  optionsOrFallback?: O | false | RangeInput<I>,
  maybeOptions?: O | false
) {
  return format(
    optionsOrFallback as I,
    maybeOptions,
    rangeFormat as IntlFormatFn<F, I, O>
  )
}
