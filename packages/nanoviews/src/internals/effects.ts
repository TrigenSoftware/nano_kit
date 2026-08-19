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

  // Render under the injection context; starting the scope is not the
  // renderer's move
  return (fn: () => void, replace?: DeferredScope): DeferredScope => unsafeRun(context, factory, fn, replace)
}

export function effectScopeSwapper<T>(
  $signal: Accessor<T>,
  callback: EffectScopeSwapperCallback<T>
) {
  let prev: DeferredScope | undefined

  // The swap starts what it returns. Before the mount walk the scope's
  // anchor is still lazy and the start is a no-op, so the walk keeps the
  // block's position; after it the swapped-in content comes up on the
  // swap's own stack, so a swap correcting a write made mid-render leaves
  // no scope behind that is rendered but never started
  effect(() => {
    const value = $signal()

    prev = untracked(() => startScope(callback(prev, value)))
  }, true)
}
