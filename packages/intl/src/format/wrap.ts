import {
  type Accessor,
  type SignalishValue,
  isFunction
} from '@nano_kit/store'
import { read } from '../utils.js'
import type {
  AnyFormat,
  Format
} from './types.js'

export type WrapValues<A> = A extends Accessor<infer V>
  ? V
  : A extends Record<string, unknown>
    ? {
      [K in keyof A]: SignalishValue<A[K]>
    }
    : A

export type WrapArgs<R> = [R] extends [(arg: infer A) => unknown]
  ? [message: R, values: WrapValues<A>, locale: string]
  : [message: R, locale: string]

export type Wrapped<R, O> = [R] extends [(arg: infer A) => unknown]
  ? (arg: A) => O
  : O

/**
 * Creates a formatter that wraps a message with a function deciding what it renders.
 * @param format - Formatter of the message to wrap.
 * @param fn - Function that receives the wrapped message and the active locale and returns what the message renders. A message function is passed as is, followed by the values of its call read from signals and accessors, for `fn` to call with the values it chooses.
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
      ? (arg: unknown) => fn(message, read(arg), locale)
      : fn(message, locale)
  }
}
