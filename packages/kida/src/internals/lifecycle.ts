import {
  type AnySignal,
  type AnyAccessor,
  type MaybeDestroy,
  type AccessorValue,
  type Mountable,
  onMounted,
  effect,
  untracked
} from 'agera'

function onStartStop(
  $signal: Mountable<AnySignal>,
  startstop: boolean,
  listener: () => MaybeDestroy
) {
  let destroy: MaybeDestroy

  return onMounted(
    $signal,
    mounted => destroy = mounted === startstop
      ? listener()
      : (destroy?.(), undefined)
  )
}

/**
 * Listen to signal start.
 * @param $signal - The signal to listen to.
 * @param listener - The listener function that returns a destroy function.
 * @returns Function to stop listening.
 */
export function onStart(
  $signal: Mountable<AnySignal>,
  listener: () => MaybeDestroy
) {
  return onStartStop($signal, true, listener)
}

/**
 * Listen to signal stop.
 * @param $signal - The signal to listen to.
 * @param listener - The listener function that returns a destroy function.
 * @returns Function to stop listening.
 */
export function onStop(
  $signal: Mountable<AnySignal>,
  listener: () => MaybeDestroy
) {
  return onStartStop($signal, false, listener)
}

export const STORE_UNMOUNT_DELAY = 1000

/**
 * Listen to signal mount and unmount.
 * Unmount is delayed to avoid rapid mount/unmount cycles.
 * @param $signal - The signal to listen to.
 * @param listener - The mount listener function that returns an unmount listener.
 * @returns Function to stop listening.
 */
export function onMount(
  $signal: Mountable<AnySignal>,
  listener: () => MaybeDestroy
) {
  let destroy: MaybeDestroy
  let timer: ReturnType<typeof setTimeout> | undefined

  return onMounted($signal, (mounted) => {
    if (mounted) {
      // A pending teardown is the listener still being alive: cancel it
      // instead of starting a second one. Levels alternate per listener, so
      // no timer means it was torn down and has to be started anew
      if (timer) {
        clearTimeout(timer)
      } else {
        destroy = listener()
      }
    } else {
      timer = setTimeout(() => {
        destroy?.()
        destroy = timer = undefined
      }, STORE_UNMOUNT_DELAY)
    }
  })
}

/**
 * Start the signal and keep it alive.
 * @param $signal - The signal to keep alive.
 * @returns Function to stop keeping the signal alive.
 */
export function start($signal: AnyAccessor) {
  return effect(() => {
    $signal()
  })
}

/**
 * Start and stop the signal immediately if it's not started.
 * @param $signal - The signal to execute.
 * @returns The signal.
 */
export function exec<T extends AnyAccessor>($signal: T): AccessorValue<T> {
  start($signal)()

  return untracked($signal)
}

