import {
  type Signalish,
  $get
} from '@nano_kit/store'
import type { Format } from './types.js'
import { intlformat } from './intlformat.js'

export type RelativeTimeUnit = Exclude<Intl.RelativeTimeFormatUnitSingular, 'quarter'>

export interface RelativeTimeOptions extends Intl.RelativeTimeFormatOptions {
  /**
   * The largest unit to format in, `'year'` by default.
   */
  largestUnit?: RelativeTimeUnit
  /**
   * The smallest unit to format in, `'second'` by default.
   */
  smallestUnit?: RelativeTimeUnit
  /**
   * The moment to count from, the current time by default. A signal or an accessor is followed.
   */
  relativeTo?: Signalish<Date | number | string>
}

const units: RelativeTimeUnit[] = ['year', 'month', 'week', 'day', 'hour', 'minute', 'second']
/* Unit lengths in milliseconds. A month is 30 days and a year 365: the distance picks the unit,
   not the calendar */
// oxlint-disable-next-line eslint/no-magic-numbers
const lengths = [31_536_000_000, 2_592_000_000, 604_800_000, 86_400_000, 3_600_000, 60_000, 1_000]

function relativeTimeFormat(
  fmt: Intl.RelativeTimeFormat,
  value: Date | number | string,
  {
    largestUnit = 'year',
    smallestUnit = 'second',
    relativeTo = Date.now()
  }: RelativeTimeOptions = {}
) {
  const distance = new Date(value).getTime() - new Date($get(relativeTo)).getTime()
  const last = units.indexOf(smallestUnit)
  let index = units.indexOf(largestUnit)

  // The largest unit the distance fills at least once
  while (index < last && Math.abs(distance) < lengths[index]) {
    index++
  }

  const count = Math.trunc(distance / lengths[index])

  // Zero of a time unit, from hours down, reads as "now", zero of a calendar unit as "today"
  // oxlint-disable-next-line eslint/no-magic-numbers
  return fmt.format(count, count || index < 4 ? units[index] : 'second')
}

/**
 * Creates a relative time formatter in raw mode.
 * @param options - Pass `false` to return the input value without formatting.
 * @returns Formatter that returns the input value or `undefined`.
 */
export function relativetime(
  options: false
): Format<Date | number | string | undefined>

/**
 * Creates a locale-aware relative time formatter. It counts the distance from the input to
 * `relativeTo` and formats it in the largest unit the distance fills.
 * @param options - `Intl.RelativeTimeFormat` options with the unit range and the moment to count from.
 * @returns Formatter that returns a formatted string or `undefined`.
 */
export function relativetime(
  options?: RelativeTimeOptions
): Format<Date | number | string | undefined, string | undefined>

/**
 * Creates a relative time formatter in raw mode with a fallback value.
 * @param fallback - Value returned when the input is `undefined` or `null`.
 * @param options - Pass `false` to return the input value or fallback without formatting.
 * @returns Formatter that returns the input value or fallback.
 */
export function relativetime(
  fallback: Date | number | string,
  options: false
): Format<Date | number | string | undefined, Date | number | string>

/**
 * Creates a locale-aware relative time formatter with a fallback value.
 * @param fallback - Value used when the input is `undefined` or `null`.
 * @param options - `Intl.RelativeTimeFormat` options with the unit range and the moment to count from, or `{}` for the defaults.
 * @returns Formatter that returns a formatted string or `undefined`.
 */
export function relativetime(
  fallback: Date | number | string,
  options: RelativeTimeOptions
): Format<Date | number | string | undefined, string | undefined>

/* @__NO_SIDE_EFFECTS__ */
export function relativetime(
  optionsOrFallback?: RelativeTimeOptions | false | Date | number | string,
  maybeOptions?: RelativeTimeOptions | false
) {
  return intlformat(
    Intl.RelativeTimeFormat,
    relativeTimeFormat,
    optionsOrFallback,
    maybeOptions
  )
}
