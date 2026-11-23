import type {
  Accessor,
  AnyFn
} from '@nano_kit/store'
import type {
  FormatContext,
  UnionToIntersection
} from '../types.js'

export type { UnionToIntersection }

type ObjectParams<T> = T extends object
  ? T extends AnyFn
    ? never
    : T
  : never

export type ParamsOf<T> = T extends (params: infer P) => unknown ? ObjectParams<P> : {}

export type Format<I, O = I> = (ctx: FormatContext, input?: I) => O

export type AnyFormat<O = unknown> = Format<any, O>

declare const message: unique symbol

/**
 * Format of a message function, like one of `params`, `plural` or `match`.
 * The mark keeps TypeScript from deferring the generic call that makes the format,
 * so tag handlers given before it, as in `rich(tags, params(...))`, get the values of the call typed.
 */
export type MessageFormat<I, O> = Format<I, O> & {
  readonly [message]?: true
}

export type FormatInput<F> = F extends Format<infer I, unknown> ? I : never

export type FormatOutput<F> = F extends Format<never, infer O> ? O : never

export type FormatsInput<T extends Partial<Record<PropertyKey, AnyFormat>>> = Partial<{
  [K in keyof T]: FormatInput<T[K]>
}>

export type FnWithParams<P> = (params: P) => string | undefined

// A value read from a signal or an accessor. Unlike `SignalishValue`, it keeps a param typed by both `params` and `plural` as their common type
type ReadValue<T> = Exclude<T, Accessor<any>>

/**
 * Values of a call of a message function, read from signals and accessors.
 */
export type ReadValues<A> = A extends Accessor<infer V>
  ? V
  : A extends Record<string, unknown>
    ? {
      [K in keyof A]: ReadValue<A[K]>
    }
    : A

export interface IntlFormat<T> {
  format(value: T, ...args: unknown[]): string
}

export interface IntlFormatRange<T> extends IntlFormat<T> {
  formatRange(from: T, to: T): string
}
