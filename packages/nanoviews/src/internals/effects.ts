import {
  type Accessor,
  type Destroy,
  effect,
  deferScope,
  getInjector,
  run,
  untracked
} from 'kida'
import type { EffectScopeSwapperCallback } from './types/index.js'

export function deferScopeBindContext(context = getInjector()) {
  return (fn => deferScope(() => run(context, fn))) as typeof deferScope
}

export function effectScopeSwapper<T>(
  $signal: Accessor<T>,
  callback: EffectScopeSwapperCallback<T>
) {
  let prevValue: T | undefined
  let start: (() => Destroy) | undefined
  let stop: Destroy | undefined

  effect((warmup) => {
    const value = $signal()

    stop = untracked(() => callback(stop, value, prevValue))

    if (warmup) {
      start = stop as () => Destroy
      stop = undefined
    }

    prevValue = value
  }, true)

  effect(() => {
    stop = start!()
    start = undefined

    return () => stop!()
  })
}
