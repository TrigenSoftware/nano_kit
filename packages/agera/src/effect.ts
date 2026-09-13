import type {
  Accessor,
  ObserverCallback,
  ReadableSignal
} from './internals/types.js'
import {
  effect,
  deferEffect,
  effectScope,
  deferScope,
  boundDeferScope,
  startScope,
  stopScope,
  pauseScope,
  resumeScope,
  pushActiveSub,
  popActiveSub
} from './internals/system.js'

export {
  effect,
  deferEffect,
  boundDeferScope,
  effectScope,
  deferScope,
  startScope,
  stopScope,
  pauseScope,
  resumeScope
}

/**
 * Subscribe to accessor changes.
 * Callback will be called immediately.
 * Will trigger accessor mount if applicable.
 * @param $accessor - The accessor to subscribe to.
 * @param fn - The callback to call on value change.
 * @returns A function to stop the subscription.
 */
export function subscribe<T>(
  $accessor: Accessor<T>,
  fn: ObserverCallback<T>
) {
  return effect(() => {
    const value = $accessor()
    // The observer callback is user code: run it untracked, without
    // allocating a closure for it on every run
    const prevSub = pushActiveSub(undefined)

    try {
      fn(value)
    } finally {
      popActiveSub(prevSub)
    }
  })
}

/**
 * Listen accessor changes.
 * Callback will be called only on value change, without initial call.
 * Will trigger accessor mount if applicable.
 * @param $accessor - The accessor to subscribe to.
 * @param fn - The callback to call on value change.
 * @returns A function to stop the subscription.
 */
export function listen<T>(
  $accessor: Accessor<T>,
  fn: ObserverCallback<T>
) {
  return effect((warmup) => {
    const value = $accessor()

    if (!warmup) {
      const prevSub = pushActiveSub(undefined)

      try {
        fn(value)
      } finally {
        popActiveSub(prevSub)
      }
    }
  })
}

/**
 * Observe accessor changes.
 * Callback will be called only on value change, without initial call.
 * Will not trigger accessor mount.
 * @param $accessor - The accessor to subscribe to.
 * @param fn - The callback to call on value change.
 * @returns A function to stop the subscription.
 */
export function observe<T>(
  $accessor: ReadableSignal<T>,
  fn: ObserverCallback<T>
) {
  // The exemption is the node the subscription links, preset on the
  // subscriber itself: no context window is needed to pair them with the
  // signal, and no derivation can be named in place of the direct dep
  return effect((warmup) => {
    const value = $accessor()

    if (!warmup) {
      const prevSub = pushActiveSub(undefined)

      try {
        fn(value)
      } finally {
        popActiveSub(prevSub)
      }
    }
  }, $accessor.node)
}
