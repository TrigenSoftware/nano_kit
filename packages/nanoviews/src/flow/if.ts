import {
  isAccessor,
  boolean
} from 'kida'
import type {
  TruthySignalish,
  FalsySignalish,
  Child
} from '../internals/index.js'
import { swap_ } from './swap.js'

/**
 * Decide which child to render based on condition
 * @param $value - Static value or store
 * @returns Function that accepts then and else functions and returns Block that renders decided child
 */
export function if_<T>($value: T) {
  /**
   * Decide which child to render based on condition
   * @param then_ - Function that returns child if condition is true
   * @param else_ - Function that returns child if condition is false
   * @returns Block that renders decided child
   */
  return (
    then_: (value: TruthySignalish<T>) => Child,
    else_?: (value: FalsySignalish<T>) => Child
  ) => swap_(
    isAccessor($value) ? boolean($value) : $value as boolean,
    confition => (
      confition
        ? then_($value as TruthySignalish<T>)
        : else_?.($value as FalsySignalish<T>)
    )
  )
}
