import {
  type Accessor,
  type SignalishValue,
  $get,
  isFunction
} from '@nano_kit/store'
import type {
  AnyFormat,
  Format
} from './types.js'

export type WrapValues<A> = A extends Accessor<infer V>
  ? V
  : A extends object
    ? {
      [K in keyof A]: SignalishValue<A[K]>
    }
    : A

export type WrapArgs<R> = [R] extends [(arg: infer A) => unknown]
  ? [values: WrapValues<A>, message: R, locale: string]
  : [message: R, locale: string]

export type Wrapped<R, O> = [R] extends [(arg: infer A) => unknown]
  ? (arg: A) => O
  : O

function read(arg: unknown) {
  if (typeof arg !== 'object' || !arg) {
    return $get(arg)
  }

  const values: Record<string, unknown> = {}

  for (const key in arg) {
    values[key] = $get((arg as Record<string, unknown>)[key])
  }

  return values
}

/**
 * Creates a formatter that wraps a message with a function deciding what it renders.
 * @param format - Formatter of the message to wrap.
 * @param fn - Function that receives the wrapped message and the active locale and returns what the message renders. A message function is passed as is, after the values of its call read from signals and accessors, for `fn` to call with the values it chooses.
 * @returns Formatter that returns what `fn` returns, or a message function returning it.
 */
export function wrap<I, R, O>(
  format: Format<I, R>,
  fn: (...args: WrapArgs<R>) => O
): Format<I, Wrapped<R, O>>

/* @__NO_SIDE_EFFECTS__ */
export function wrap(
  format: AnyFormat,
  fn: (...args: any[]) => unknown
): AnyFormat {
  return (ctx, input) => {
    const message = format(ctx, input)
    const locale = ctx.$locale()

    return isFunction(message)
      ? (arg: unknown) => fn(read(arg), message, locale)
      : fn(message, locale)
  }
}
