import type {
  AnyFn,
  AnyObject,
  EmptyValue,
  FalsyValue,
  Destroy,
  MaybeDestroy,
  EffectCallback,
  Accessor,
  ValueOrAccessor
} from 'kida'

export type {
  EffectCallback,
  Destroy,
  MaybeDestroy,
  AnyFn,
  AnyObject,
  EmptyValue,
  FalsyValue
}

export type Primitive = string | number | boolean | EmptyValue

/**
 * Extract non-empty value type
 */
export type NonEmptyValue<T> = T extends EmptyValue ? never : T

export type AccessibleProps<T> = {
  [K in keyof T]?: ValueOrAccessor<T[K]>
}

export type TruthySignal<T> = T extends Accessor<infer U>
  ? U extends FalsyValue
    ? never
    : T
  : never

export type TruthyValueOrSignal<T> = T extends Accessor<infer U>
  ? U extends FalsyValue
    ? never
    : T
  : T extends FalsyValue
    ? never
    : T

export type FalsySignal<T> = T extends Accessor<infer U>
  ? U extends FalsyValue
    ? T
    : never
  : never

export type FalsyValueOrSignal<T> = T extends Accessor<infer U>
  ? U extends FalsyValue
    ? T
    : never
  : T extends FalsyValue
    ? T
    : never
