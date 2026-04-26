import type {
  AnySignal,
  Morph,
  Mountable,
  NewValue,
  ReadableSignal,
  SignalNode,
  WritableSignal
} from './internals/types.js'
import {
  signal,
  computed,
  batch,
  createSignal,
  nextValue,
  signalNextValue
} from './internals/system.js'
import { noMount } from './internals/lifecycle.js'
import { listen } from './effect.js'

export {
  signal,
  computed,
  batch,
  nextValue,
  signalNextValue
}

/**
 * Listen for mount and unmount events on a mountable signal.
 * @param $signal - The signal to subscribe to.
 * @param listener - The listener to call when the signal is mounted or not.
 * @returns A function to stop the subscription.
 */
export function onMounted(
  $signal: Mountable<AnySignal>,
  listener: (mounted: boolean) => void
) {
  const $mounted = $signal.node.mounted ||= signal(false)

  return noMount($signal, () => listen($mounted, listener, true))
}

export function morph<T, C extends Partial<Morph<T>>>(
  $signal: WritableSignal<T>,
  context: C
): WritableSignal<T>

export function morph<T, C extends Partial<Morph<T>>>(
  $signal: ReadableSignal<T>,
  context: C
): ReadableSignal<T>

/* @__NO_SIDE_EFFECTS__ */
export function morph<T, C extends Partial<Morph<T>>>(
  $signal: ReadableSignal<T> | WritableSignal<T>,
  context: C
) {
  return createSignal(morphOper, $signal.node as SignalNode, {
    source: $signal,
    set: $signal,
    get: $signal,
    ...context
  } as Morph)
}

function morphOper<T>(this: Morph<T>, ...value: [NewValue<T>]): T | void {
  if (value.length) {
    this.set(value[0])
  } else {
    return this.get()
  }
}
