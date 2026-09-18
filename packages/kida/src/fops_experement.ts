import {
  type Accessor,
  type SignalishValue,
  isAccessor
} from 'agera'
import type {
  AnyCollection,
  AnyFn,
  EmptyValue,
  Signalish
} from './types.js'
import { $get } from './utils.js'

/**
 * What an operator returns for the given operands: an accessor when one of them is an accessor
 * for sure, the plain result when none can be, and either when an operand may turn out both ways.
 */
export type Fop<V extends unknown[], R> = true extends { [K in keyof V]: [V[K]] extends [AnyFn] ? true : false }[number]
  ? Accessor<R>
  : Extract<V[number], AnyFn> extends never
    ? R
    : Signalish<R>

/**
 * Logical OR: the first truthy value of two operands.
 * @param left - First operand
 * @param right - Second operand
 * @returns The first truthy value, or an accessor of it when there is an accessor among the operands
 */
export function or<L, R>(
  left: L,
  right: R
): Fop<[L, R], SignalishValue<L> | SignalishValue<R>>

/* @__NO_SIDE_EFFECTS__ */
export function or(left: unknown, right: unknown) {
  const fn = () => $get(left) || $get(right)

  return isAccessor(left) || isAccessor(right) ? fn : fn()
}

/**
 * Variadic logical OR: the first truthy value of the operands, or the last one.
 * @param args - Variable number of operands
 * @returns The first truthy value, or an accessor of it when there is an accessor among the operands
 */
export function some<V extends unknown[]>(...args: V): Fop<V, SignalishValue<V[number]>>

/* @__NO_SIDE_EFFECTS__ */
export function some(...args: unknown[]) {
  const fn = () => {
    let value: unknown

    for (let i = 0, len = args.length; i < len; i++) {
      value = $get(args[i])

      if (value) {
        return value
      }
    }

    return value
  }

  return args.some(isAccessor) ? fn : fn()
}

/**
 * Logical AND: the first falsy value of two operands, or the second one.
 * @param left - First operand
 * @param right - Second operand
 * @returns The AND result, or an accessor of it when there is an accessor among the operands
 */
export function and<L, R>(
  left: L,
  right: R
): Fop<[L, R], SignalishValue<L> | SignalishValue<R>>

/* @__NO_SIDE_EFFECTS__ */
export function and(left: unknown, right: unknown) {
  const fn = () => $get(left) && $get(right)

  return isAccessor(left) || isAccessor(right) ? fn : fn()
}

/**
 * Variadic logical AND: the first falsy value of the operands, or the last one.
 * @param args - Variable number of operands
 * @returns The AND result, or an accessor of it when there is an accessor among the operands
 */
export function every<V extends unknown[]>(...args: V): Fop<V, SignalishValue<V[number]>>

/* @__NO_SIDE_EFFECTS__ */
export function every(...args: unknown[]) {
  const fn = () => {
    let value: unknown

    for (let i = 0, len = args.length; i < len; i++) {
      value = $get(args[i])

      if (!value) {
        return value
      }
    }

    return value
  }

  return args.some(isAccessor) ? fn : fn()
}

/**
 * Logical NOT: the negation of a value.
 * @param value - The value to negate
 * @returns The negated boolean, or an accessor of it when the value is an accessor
 */
export function not<T>(value: T): Fop<[T], boolean>

/* @__NO_SIDE_EFFECTS__ */
export function not(value: unknown) {
  const fn = () => !$get(value)

  return isAccessor(value) ? fn : fn()
}

/**
 * Strict equality (===).
 * @param left - First value to compare
 * @param right - Second value to compare
 * @returns Whether the values are equal, or an accessor of it when there is an accessor among them
 */
export function is<L, R>(
  left: L,
  right: R
): Fop<[L, R], boolean>

/* @__NO_SIDE_EFFECTS__ */
export function is(left: unknown, right: unknown) {
  const fn = () => $get(left) === $get(right)

  return isAccessor(left) || isAccessor(right) ? fn : fn()
}

/**
 * Strict inequality (!==).
 * @param left - First value to compare
 * @param right - Second value to compare
 * @returns Whether the values differ, or an accessor of it when there is an accessor among them
 */
export function isNot<L, R>(
  left: L,
  right: R
): Fop<[L, R], boolean>

/* @__NO_SIDE_EFFECTS__ */
export function isNot(left: unknown, right: unknown) {
  const fn = () => $get(left) !== $get(right)

  return isAccessor(left) || isAccessor(right) ? fn : fn()
}

/**
 * Greater than (>).
 * @param left - Left operand
 * @param right - Right operand
 * @returns Whether left > right, or an accessor of it when there is an accessor among the operands
 */
export function gt<L extends Signalish<number>, R extends Signalish<number>>(
  left: L,
  right: R
): Fop<[L, R], boolean>

/* @__NO_SIDE_EFFECTS__ */
export function gt(left: Signalish<number>, right: Signalish<number>) {
  const fn = () => $get(left) > $get(right)

  return isAccessor(left) || isAccessor(right) ? fn : fn()
}

/**
 * Greater than or equal (>=).
 * @param left - Left operand
 * @param right - Right operand
 * @returns Whether left >= right, or an accessor of it when there is an accessor among the operands
 */
export function gte<L extends Signalish<number>, R extends Signalish<number>>(
  left: L,
  right: R
): Fop<[L, R], boolean>

/* @__NO_SIDE_EFFECTS__ */
export function gte(left: Signalish<number>, right: Signalish<number>) {
  const fn = () => $get(left) >= $get(right)

  return isAccessor(left) || isAccessor(right) ? fn : fn()
}

/**
 * Less than (<).
 * @param left - Left operand
 * @param right - Right operand
 * @returns Whether left < right, or an accessor of it when there is an accessor among the operands
 */
export function lt<L extends Signalish<number>, R extends Signalish<number>>(
  left: L,
  right: R
): Fop<[L, R], boolean>

/* @__NO_SIDE_EFFECTS__ */
export function lt(left: Signalish<number>, right: Signalish<number>) {
  const fn = () => $get(left) < $get(right)

  return isAccessor(left) || isAccessor(right) ? fn : fn()
}

/**
 * Less than or equal (<=).
 * @param left - Left operand
 * @param right - Right operand
 * @returns Whether left <= right, or an accessor of it when there is an accessor among the operands
 */
export function lte<L extends Signalish<number>, R extends Signalish<number>>(
  left: L,
  right: R
): Fop<[L, R], boolean>

/* @__NO_SIDE_EFFECTS__ */
export function lte(left: Signalish<number>, right: Signalish<number>) {
  const fn = () => $get(left) <= $get(right)

  return isAccessor(left) || isAccessor(right) ? fn : fn()
}

/**
 * Ternary conditional (?:): one of two values, picked by a condition.
 * @param condition - The condition to evaluate
 * @param then - Value to return if the condition is truthy
 * @param otherwise - Optional value to return if the condition is falsy
 * @returns The picked value, or an accessor of it when there is an accessor among the operands
 */
export function when<C, T, U = undefined>(
  condition: C,
  then: T,
  otherwise?: U
): Fop<[C, T, U], SignalishValue<T> | SignalishValue<U> | undefined>

/* @__NO_SIDE_EFFECTS__ */
export function when(condition: unknown, then: unknown, otherwise?: unknown) {
  const fn = () => ($get(condition) ? $get(then) : otherwise && $get(otherwise))

  return isAccessor(condition) || isAccessor(then) || isAccessor(otherwise) ? fn : fn()
}

/**
 * The value a collection holds at a key, `undefined` for an empty key.
 */
export type Picked<C, K> = C extends AnyCollection
  ? K extends keyof C
    ? C[K]
    : undefined
  : undefined

/**
 * Lookup: the value a collection holds at a key.
 * @param collection - An object or an array
 * @param key - The key or the index
 * @returns The value at the key, or an accessor of it when the collection or the key is an accessor
 * @example
 * ```ts
 * const $class = pick(styles, $variant)
 * ```
 */
export function pick<C extends Signalish<AnyCollection>, K extends Signalish<PropertyKey | EmptyValue>>(
  collection: C,
  key: K
): Fop<[C, K], Picked<SignalishValue<C>, SignalishValue<K>>>

/* @__NO_SIDE_EFFECTS__ */
export function pick(collection: Signalish<AnyCollection>, key: Signalish<PropertyKey | EmptyValue>) {
  const fn = (): unknown => $get(collection)[$get(key) as string]

  return isAccessor(collection) || isAccessor(key) ? fn : fn()
}

type TextValue = string | number | boolean | bigint | EmptyValue

/**
 * Template tag: the text of a template literal. An empty value adds nothing.
 * @param strings - The static parts of the template
 * @param values - The values between them
 * @returns The text, or an accessor of it when there is an accessor among the values
 * @example
 * ```ts
 * const $href = f`${$spriteUrl}#${name}`
 * ```
 */
export function f<V extends Signalish<TextValue>[]>(
  strings: TemplateStringsArray,
  ...values: V
): Fop<V, string>

/* @__NO_SIDE_EFFECTS__ */
export function f(
  strings: TemplateStringsArray,
  ...values: Signalish<TextValue>[]
) {
  const fn = () => {
    let text = strings[0]

    for (let i = 0, len = values.length; i < len; i++) {
      text += ($get(values[i]) ?? '') + strings[i + 1]
    }

    return text
  }

  return values.some(isAccessor) ? fn : fn()
}
