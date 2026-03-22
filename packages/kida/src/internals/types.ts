import type {
  AnyWritableSignal,
  AnyReadableSignal,
  AnyAccessorOrSignal,
  WritableSignal,
  ReadableSignal,
  Accessor,
  AnyAccessor
} from 'agera'

export type { AnyFn } from 'agera'

export type AnyObject = Record<PropertyKey, any>

export type AnyCollection = Record<number | string, any>

export type EmptyValue = undefined | null | void

export type FalsyValue = EmptyValue | false | '' | 0

export type PickNonEmptyValue<T> = T extends EmptyValue ? never : T

export type PickEmptyValue<T> = T extends EmptyValue ? T : never

export type PickObjectValue<T> = T extends AnyObject ? T : never

export type ValueOrSignal<T> = T | ReadableSignal<T>

export type ValueOrWritableSignal<T> = T | WritableSignal<T>

export type ValueOrAccessor<T> = T | Accessor<T>

export type AnyValueOrAccessor = ValueOrAccessor<any>

export type ToSignal<T> = [T] extends [AnyWritableSignal]
  ? T
  : [T] extends [AnyReadableSignal]
    ? T
    : [T] extends [Accessor<infer V>]
      ? ReadableSignal<V>
      : WritableSignal<Exclude<T, AnyAccessorOrSignal>> | ToSignal<Extract<T, AnyAccessorOrSignal>>

export type ToAccessor<T> = [T] extends [AnyAccessor]
  ? T
  : Accessor<Exclude<T, AnyAccessor>> | Extract<T, AnyAccessor>

export type ToAccessorOrSignal<T> = [T] extends [AnyAccessor]
  ? T
  : WritableSignal<Exclude<T, AnyAccessor>> | Extract<T, AnyAccessor>
