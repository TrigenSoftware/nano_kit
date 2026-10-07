import {
  type Signalish,
  $get
} from '@nano_kit/store'
import type { FormatContext } from '../types.js'
import type {
  AnyFormat,
  Format,
  FormatInput,
  FormatOutput
} from './types.js'

export type Formatter<F extends AnyFormat> = (
  value: Signalish<FormatInput<F> | null>
) => FormatOutput<F>

/**
 * Creates a formatter value from another format.
 * @param type - Format used to format values later.
 * @returns Format that returns a value formatter bound to the current context. The formatter reads a signal or an accessor passed as the value and takes `null` as a missing value.
 */
export function format<F extends AnyFormat>(
  type: F
): Format<undefined, Formatter<F>>

/* @__NO_SIDE_EFFECTS__ */
export function format<F extends AnyFormat>(
  type: F
) {
  return (ctx: FormatContext) => (value: Signalish<FormatInput<F> | null>) => type(ctx, $get(value))
}
