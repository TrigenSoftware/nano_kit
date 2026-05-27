import type { FormatContext } from '../types.js'
import type {
  AnyFormat,
  Format,
  FormatInput,
  FormatOutput
} from './types.js'

export type Formatter<F extends AnyFormat> = (
  value: FormatInput<F>
) => FormatOutput<F>

/**
 * Creates a formatter value from another format.
 * @param type - Format used to format values later.
 * @returns Format that returns a value formatter bound to the current context.
 */
export function format<F extends AnyFormat>(
  type: F
): Format<undefined, Formatter<F>>

/* @__NO_SIDE_EFFECTS__ */
export function format<F extends AnyFormat>(
  type: F
) {
  return (ctx: FormatContext) => (value: FormatInput<F>) => type(ctx, value)
}
