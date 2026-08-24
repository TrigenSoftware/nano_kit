import type { Accessor } from 'agera'
import type { Signalish } from './types.js'
import { $get } from './utils.js'

/**
 * Logical OR. Returns an accessor for the first truthy value from two operands.
 * @param left - First operand
 * @param right - Second operand
 * @returns An accessor that returns the first truthy value
 */
/* @__NO_SIDE_EFFECTS__ */
export function or<L, R>(
  left: Signalish<L>,
  right: Signalish<R>
): Accessor<L | R> {
  return () => $get(left) || $get(right)
}

/**
 * Variadic logical OR. Returns an accessor for the first truthy value from multiple operands.
 * @param args - Variable number of operands
 * @returns An accessor that returns the first truthy value
 */
/* @__NO_SIDE_EFFECTS__ */
export function some<T>(...args: Signalish<T>[]): Accessor<T> {
  return () => {
    let value: T

    for (let i = 0, len = args.length; i < len; i++) {
      value = $get(args[i])

      if (value) {
        return value
      }
    }

    return value!
  }
}

/**
 * Logical AND. Returns an accessor for the result of logical AND operation between two operands.
 * @param left - First operand
 * @param right - Second operand
 * @returns An accessor that returns the AND result
 */
/* @__NO_SIDE_EFFECTS__ */
export function and<L, R>(
  left: Signalish<L>,
  right: Signalish<R>
): Accessor<L | R> {
  return () => $get(left) && $get(right)
}

/**
 * Variadic logical AND. Returns an accessor for the last value if all operands are truthy.
 * @param args - Variable number of operands
 * @returns An accessor that returns the last value if all are truthy
 */
/* @__NO_SIDE_EFFECTS__ */
export function every<T>(...args: Signalish<T>[]): Accessor<T> {
  return () => {
    let value: T

    for (let i = 0, len = args.length; i < len; i++) {
      value = $get(args[i])

      if (!value) {
        return value
      }
    }

    return value!
  }
}

/**
 * Logical NOT. Returns an accessor for the logical negation of a value.
 * @param value - The value to negate
 * @returns An accessor that returns the negated boolean result
 */
/* @__NO_SIDE_EFFECTS__ */
export function not<T>(value: Signalish<T>): Accessor<boolean> {
  return () => !$get(value)
}

/**
 * Strict equality (===). Returns an accessor that yields true if values are strictly equal.
 * @param left - First value to compare
 * @param right - Second value to compare
 * @returns An accessor that returns true if values are equal
 */
/* @__NO_SIDE_EFFECTS__ */
export function is(
  left: Signalish<unknown>,
  right: Signalish<unknown>
): Accessor<boolean> {
  return () => $get(left) === $get(right)
}

/**
 * Strict inequality (!==). Returns an accessor that yields true if values are not strictly equal.
 * @param left - First value to compare
 * @param right - Second value to compare
 * @returns An accessor that returns true if values are not equal
 */
/* @__NO_SIDE_EFFECTS__ */
export function isNot(
  left: Signalish<unknown>,
  right: Signalish<unknown>
): Accessor<boolean> {
  return () => $get(left) !== $get(right)
}

/**
 * Greater than (>). Returns an accessor that yields true if left > right.
 * @param left - Left operand
 * @param right - Right operand
 * @returns An accessor that returns true if left > right
 */
/* @__NO_SIDE_EFFECTS__ */
export function gt(
  left: Signalish<number>,
  right: Signalish<number>
): Accessor<boolean> {
  return () => $get(left) > $get(right)
}

/**
 * Greater than or equal (>=). Returns an accessor that yields true if left >= right.
 * @param left - Left operand
 * @param right - Right operand
 * @returns An accessor that returns true if left >= right
 */
/* @__NO_SIDE_EFFECTS__ */
export function gte(
  left: Signalish<number>,
  right: Signalish<number>
): Accessor<boolean> {
  return () => $get(left) >= $get(right)
}

/**
 * Less than (<). Returns an accessor that yields true if left < right.
 * @param left - Left operand
 * @param right - Right operand
 * @returns An accessor that returns true if left < right
 */
/* @__NO_SIDE_EFFECTS__ */
export function lt(
  left: Signalish<number>,
  right: Signalish<number>
): Accessor<boolean> {
  return () => $get(left) < $get(right)
}

/**
 * Less than or equal (<=). Returns an accessor that yields true if left <= right.
 * @param left - Left operand
 * @param right - Right operand
 * @returns An accessor that returns true if left <= right
 */
/* @__NO_SIDE_EFFECTS__ */
export function lte(
  left: Signalish<number>,
  right: Signalish<number>
): Accessor<boolean> {
  return () => $get(left) <= $get(right)
}

/**
 * Ternary conditional (?:). Returns an accessor for a conditional value based on a condition.
 * @param condition - The condition to evaluate
 * @param then - Value to return if condition is truthy
 * @param otherwise - Optional value to return if condition is falsy
 * @returns An accessor that returns the conditional result
 */
/* @__NO_SIDE_EFFECTS__ */
export function when<T, U>(
  condition: Signalish<unknown>,
  then: Signalish<T>,
  otherwise?: Signalish<U>
): Accessor<T | U | undefined> {
  return () => ($get(condition) ? $get(then) : otherwise && $get(otherwise))
}
