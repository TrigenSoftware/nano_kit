import type { Signalish } from '@nano_kit/store'
import type { FormatContext } from '../types.js'
import { read } from '../utils.js'
import type {
  AnyFormat,
  Format,
  FormatInput,
  FormatOutput
} from './types.js'

export type ChooseFormats<F extends Record<string, AnyFormat>> = {
  [K in keyof F]: (value: FormatInput<F[K]> | null) => FormatOutput<F[K]>
}

export type ChooseArg<V> = [V] extends [Record<string, unknown>]
  ? {
    [K in keyof V]: Signalish<V[K]>
  }
  : Signalish<V>

/**
 * Creates a callable message that renders a value with the formats a function chooses.
 * @param formats - Formats keyed by name, like `datetime` or `relativetime`.
 * @param fn - Function that receives the formats bound to the active locale, the value of the call read from a signal or an accessor, and the active locale, and returns what the message renders. Each value of a plain object passed instead is read the same way.
 * @returns Format that returns the callable message.
 */
export function choose<
  F extends Record<string, AnyFormat>,
  V = FormatInput<F[keyof F]> | null,
  O = unknown
>(
  formats: F,
  fn: (formats: ChooseFormats<F>, value: V, locale: string) => O
): Format<undefined, (value: ChooseArg<V>) => O>

/* @__NO_SIDE_EFFECTS__ */
export function choose(
  formats: Record<string, AnyFormat>,
  fn: (...args: any[]) => unknown
): AnyFormat {
  return (ctx: FormatContext) => {
    const bound: Record<string, (value: unknown) => unknown> = {}
    const locale = ctx.$locale()

    for (const key in formats) {
      bound[key] = value => formats[key](ctx, value)
    }

    return (value: unknown) => fn(bound, read(value), locale)
  }
}
