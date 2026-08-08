import {
  type Accessor,
  type DeferredScope,
  effect,
  boundDeferScope,
  startScope,
  getContext,
  unsafeRun,
  untracked
} from 'kida'
import type { EffectScopeSwapperCallback } from './types/index.js'

export function deferScopeBindContext(context = getContext()) {
  const factory = boundDeferScope()

  // Render under the injection context, start strictly outside of it
  return (fn: () => void, replace?: DeferredScope): DeferredScope => startScope(unsafeRun(context, factory, fn, replace))
}

export function effectScopeSwapper<T>(
  $signal: Accessor<T>,
  callback: EffectScopeSwapperCallback<T>
) {
  let prev: DeferredScope | undefined

  effect(() => {
    const value = $signal()

    prev = untracked(() => callback(prev, value))
  }, true)
}
