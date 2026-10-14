import type {
  Accessor,
  AccessorValue,
  AnyAccessor,
  AnyFn,
  AnyWritableSignal,
  ReadableSignal,
  SignalishValue,
  WritableSignal
} from 'agera'
import type {
  AnyObject,
  EmptyValue,
  PickEmptyValue,
  PickNonEmptyValue,
  PickObjectValue,
  RequiredMergeUnion
} from './types.js'
import {
  createProxyHandler,
  recordBase,
  toAccessorOrSignal
} from './internals/index.js'

export type GenericRecordValue = AnyObject | EmptyValue

export type ReadableRecord<
  T extends AnyAccessor
> = AccessorValue<T> extends infer V
  ? [V] extends [GenericRecordValue]
    ? [RequiredMergeUnion<PickNonEmptyValue<V>>, PickEmptyValue<V>] extends [infer Value, infer Empty]
      ? T & {
        [K in keyof Value as `$${string & K}`]-?: ReadableSignal<Value[K] | Empty>
      }
      : never
    : never
  : never

export type WritableRecord<
  T extends AnyWritableSignal
> = AccessorValue<T> extends infer V
  ? [V] extends [GenericRecordValue]
    ? [RequiredMergeUnion<PickNonEmptyValue<V>>, PickEmptyValue<V>] extends [infer Value, infer Empty]
      ? T & {
        [K in keyof Value as `$${string & K}`]-?: WritableSignal<Value[K] | Empty>
      }
      : never
    : never
  : never

export type ReadableDeepRecord<
  T extends AnyAccessor
> = AccessorValue<T> extends infer V
  ? [V] extends [GenericRecordValue]
    ? [RequiredMergeUnion<PickNonEmptyValue<V>>, PickEmptyValue<V>] extends [infer Value, infer Empty]
      ? T & {
        [K in keyof Value as `$${string & K}`]-?: PickNonEmptyValue<Value[K]> extends PickObjectValue<Value[K]>
          ? Value[K] | Empty extends infer C
            ? [C] extends [GenericRecordValue]
              ? ReadableDeepRecord<ReadableSignal<C>>
              : never
            : never
          : ReadableSignal<Value[K] | Empty>
      }
      : never
    : never
  : never

export type WritableDeepRecord<
  T extends AnyWritableSignal
> = AccessorValue<T> extends infer V
  ? [V] extends [GenericRecordValue]
    ? [RequiredMergeUnion<PickNonEmptyValue<V>>, PickEmptyValue<V>] extends [infer Value, infer Empty]
      ? T & {
        [K in keyof Value as `$${string & K}`]-?: PickNonEmptyValue<Value[K]> extends PickObjectValue<Value[K]>
          ? Value[K] | Empty extends infer C
            ? [C] extends [GenericRecordValue]
              ? WritableDeepRecord<WritableSignal<C>>
              : never
            : never
          : WritableSignal<Value[K] | Empty>
      }
      : never
    : never
  : never

const flatHandler = /* @__PURE__ */ createProxyHandler(child => child)

/**
 * Create a record signal from an object or signal with object.
 * The signal will have the same keys for property signals as the source object.
 * @param source - Source signal.
 * @returns A record signal.
 */
/* @__NO_SIDE_EFFECTS__ */
export function record<T>(source: T) {
  return recordBase(toAccessorOrSignal(source), flatHandler) as [T] extends [AnyWritableSignal]
    ? WritableRecord<T>
    : [T] extends [AnyAccessor]
      ? ReadableRecord<T>
      : [Extract<T, AnyFn>] extends [AnyWritableSignal]
        ? WritableRecord<WritableSignal<SignalishValue<T>>>
        : ReadableRecord<Accessor<SignalishValue<T>>>
}

const deepHandler = /* @__PURE__ */ createProxyHandler(deepRecord)

/**
 * Create a record signal from an deep object or signal with deep object.
 * The signal will have the same keys for property signals as the source object recursively.
 * @param source - Source signal.
 * @returns A deep record signal.
 */
/* @__NO_SIDE_EFFECTS__ */
export function deepRecord<T>(source: T) {
  return recordBase(toAccessorOrSignal(source), deepHandler) as [T] extends [AnyWritableSignal]
    ? WritableDeepRecord<T>
    : [T] extends [AnyAccessor]
      ? ReadableDeepRecord<T>
      : [Extract<T, AnyFn>] extends [AnyWritableSignal]
        ? WritableDeepRecord<WritableSignal<SignalishValue<T>>>
        : ReadableDeepRecord<Accessor<SignalishValue<T>>>
}
