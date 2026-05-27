import type { AnyFn } from '@nano_kit/store'
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

export type FormatInput<F> = F extends Format<infer I, unknown> ? I : never

export type FormatOutput<F> = F extends Format<never, infer O> ? O : never

export type FormatsInput<T extends Partial<Record<PropertyKey, AnyFormat>>> = Partial<{
  [K in keyof T]: FormatInput<T[K]>
}>

export type FnWithParams<P> = (params: P) => string | undefined

export type FnWithAnyParams = FnWithParams<any>

export interface IntlFormat<T> {
  format(value: T, ...args: unknown[]): string
}

export interface IntlFormatRange<T> extends IntlFormat<T> {
  formatRange(from: T, to: T): string
}
