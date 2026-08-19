import type {
  AnySignal,
  Destroy,
  Mountable,
  MountedListener,
  ReadableNode
} from './internals/types.js'
import {
  signal,
  computed,
  selector,
  batch,
  nextValue,
  signalNextValue,
  touchLifecycle
} from './internals/system.js'

export {
  signal,
  computed,
  selector,
  batch,
  nextValue,
  signalNextValue
}

/**
 * Listen for mount and unmount events on a mountable signal.
 * A listener registered while the signal is already mounted is called with
 * `true` at the next boundary - possibly synchronously, inside this call.
 * @param $signal - The signal to subscribe to.
 * @param listener - The listener to call when the signal is mounted or not.
 * @returns A function to stop the subscription.
 */
export function onMounted(
  $signal: Mountable<AnySignal>,
  listener: MountedListener
): Destroy {
  const node = $signal.node as ReadableNode
  const listeners = node.lcl ??= []

  listeners.push(listener)
  touchLifecycle(node)

  return () => {
    // The list holds exactly as many occurrences of `listener` as it has
    // undestroyed subscriptions of it, and the first destroy drops the
    // captured one, so the lookup misses exactly when this subscription is
    // already gone: it doubles as the destroyed flag. For the same reason
    // the destroys of a callback registered twice are interchangeable -
    // the occurrences are indistinguishable
    const at = listeners.indexOf(listener)

    if (~at) {
      listener = undefined as unknown as MountedListener
      listeners.splice(at, 1)

      // The watermark counts delivered listeners, so this holds whether or
      // not the fire loop is walking the list right now
      if (at < node.lcf!) {
        node.lcf!--
      }

      // The frozen bound of an unmount fire counts pending listeners, so a
      // splice from under it takes its slot with it and the listeners
      // registered above the bound stay above it. Outside a fire the bound
      // is stale and every fire sets it anew
      if (at < node.lce!) {
        node.lce!--
      }
    }
  }
}

/**
 * Check whether a mountable signal is currently mounted.
 * Reflects the level as of the last boundary.
 * @param $signal - The signal to check; a non-mountable signal is never mounted.
 * @returns Whether the signal is mounted.
 */
export function isMounted($signal: AnySignal): boolean {
  return ($signal.node as ReadableNode).lcd === true
}
