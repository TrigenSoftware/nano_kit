import {
  $get,
  computed
} from 'kida'
import type {
  TruthySignalish,
  Child
} from '../internals/index.js'
import { swap_ } from './swap.js'
import { default_ } from './switch.js'

export type MatchCase<T> = readonly [T, (value: TruthySignalish<T>) => Child]

// oxlint-disable-next-line typescript/no-explicit-any
export type AnyMatchCase = MatchCase<any>

/**
 * Case of `match_`: a value to test and the child to render when it holds
 * @param $value - Static value or store
 * @param then_ - Function that returns child when the value is truthy
 * @returns Case to pass to `match_`
 */
export function when_<T>(
  $value: T,
  then_: (value: TruthySignalish<T>) => Child
): MatchCase<T> {
  return [$value, then_]
}

/**
 * Render the child of the first case that holds. A cascade of conditions
 * written as a list instead of `if_` inside `if_` inside `if_`.
 *
 * The list is fixed when the block is built, and the first `default_` in it
 * is the one that answers. Cases that move together are worth a `batch`:
 * without one every write swaps the content, and the frame in between shows.
 * @param cases - Cases to decide from
 * @returns Block that renders the child of the case that holds
 */
export function match_(...cases: AnyMatchCase[]) {
  const fallback = cases.find(matchCase => matchCase[0] === default_)

  return swap_(
    // The walk stops at the case that holds, so the block reads the values
    // above it and no further: a case below the one that won is never asked,
    // and never wakes the block when it changes. `find` costs a call per case
    // over a hand-written loop - nanoseconds on a walk that happens when a
    // value changes, against bytes every consumer carries
    computed(() => cases.find(
      matchCase => matchCase[0] !== default_ && $get(matchCase[0])
    ) || fallback),
    matched => matched?.[1](matched[0])
  )
}
