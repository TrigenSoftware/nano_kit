import type {
  SignalishValue,
  Signalish
} from 'kida'
import type { Child } from '../internals/index.js'
import { swap_ } from './swap.js'

export type SwitchCase<T> = readonly [T | typeof default_, () => Child]

/**
 * Decide which child to render based on switch cases
 * @param $value - Static value or store
 * @returns Function that accepts cases and returns Block that renders decided child
 */
export function switch_<T>($value: Signalish<T>) {
  type Value = SignalishValue<T>

  /**
   * Decide which child to render based on switch cases
   * @param cases - Cases to decide from
   * @returns Block that renders decided child
   */
  return (...cases: SwitchCase<Value>[]) => {
    const casesMap = new Map<unknown, () => Child>(cases)

    return swap_($value, value => (
      casesMap.has(value)
        ? casesMap.get(value)!()
        : casesMap.get(default_)?.()
    ))
  }
}

export function case_<T>(value: T, then_: () => Child): SwitchCase<T> {
  return [value, then_]
}

export function default_(then_: () => Child): SwitchCase<typeof default_> {
  return [default_, then_]
}
