import type {
  Accessor,
  ObserverCallback,
  ReadableSignal
} from './internals/types.js'
import {
  effect,
  effectScope,
  deferScope,
  boundDeferScope,
  startScope,
  stopScope,
  untracked,
  noMount
} from './internals/system.js'

export {
  effect,
  boundDeferScope,
  effectScope,
  deferScope,
  startScope,
  stopScope
}

function singleEffect<T>(
  $accessor: Accessor<T>,
  fn: ObserverCallback<T>,
  skipWarmup: boolean,
  noDefer?: boolean
) {
  return effect((warmup) => {
    const value = $accessor()

    if (!skipWarmup || !warmup) {
      untracked(() => fn(value))
    }
  }, noDefer)
}

/**
 * Subscribe to accessor changes.
 * Callback will be called immediately.
 * Will trigger accessor mount if applicable.
 * @param $accessor - The accessor to subscribe to.
 * @param fn - The callback to call on value change.
 * @param noDefer - Ignore subscription defer.
 * @returns A function to stop the subscription.
 */
export function subscribe<T>(
  $accessor: Accessor<T>,
  fn: ObserverCallback<T>,
  noDefer?: boolean
) {
  return singleEffect($accessor, fn, false, noDefer)
}

/**
 * Listen accessor changes.
 * Callback will be called only on value change, without initial call.
 * Will trigger accessor mount if applicable.
 * @param $accessor - The accessor to subscribe to.
 * @param fn - The callback to call on value change.
 * @param noDefer - Ignore subscription defer.
 * @returns A function to stop the subscription.
 */
export function listen<T>(
  $accessor: Accessor<T>,
  fn: ObserverCallback<T>,
  noDefer?: boolean
) {
  return singleEffect($accessor, fn, true, noDefer)
}

/**
 * Observe accessor changes.
 * Callback will be called only on value change, without initial call.
 * Will not trigger accessor mount.
 * @param $accessor - The accessor to subscribe to.
 * @param fn - The callback to call on value change.
 * @param noDefer - Ignore subscription defer.
 * @returns A function to stop the subscription.
 */
export function observe<T>(
  $accessor: ReadableSignal<T>,
  fn: ObserverCallback<T>,
  noDefer?: boolean
) {
  return noMount($accessor, () => singleEffect($accessor, fn, true, noDefer))
}
