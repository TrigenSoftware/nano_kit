import {
  isAccessor,
  subscribe
} from 'agera'
import type { Signalish } from './types.js'

export * from './internals/effect.js'

/**
 * Subscribe to accessor changes or call callback with value if it's not an accessor.
 * Callback will be called immediately.
 * Will trigger accessor mount if applicable.
 * @param source - The accessor to subscribe to or a value to call the callback with.
 * @param fn - The callback to call on value change.
 * @returns A function to stop the subscription.
 */
export function subscribeAny<T>(
  source: Signalish<T>,
  callback: (value: T) => void
) {
  if (isAccessor(source)) {
    return subscribe(source, callback)
  }

  callback(source)
}
