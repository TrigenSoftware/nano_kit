import {
  type WritableSignal,
  external,
  mountable,
  onStart
} from '@nano_kit/store'

export function reactiveValue<T>(
  get: () => T | undefined,
  subscribe: (sync: () => void) => () => void
): WritableSignal<T | undefined>

export function reactiveValue<T>(
  get: () => T,
  subscribe: (sync: () => void) => () => void,
  fallback: T
): WritableSignal<T>

/* @__NO_SIDE_EFFECTS__ */
export function reactiveValue<T>(
  get: () => T | undefined,
  subscribe: (sync: () => void) => () => void,
  fallback?: T
) {
  return external<T | undefined>(($value, ops) => {
    if (typeof window === 'undefined') {
      $value(fallback)
      return
    }

    const sync = () => $value(get())

    onStart(mountable($value), () => subscribe(sync))

    ops.get = () => (sync(), $value())
  })
}

/* @__NO_SIDE_EFFECTS__ */
export function on(getTarget: () => EventTarget, event: string) {
  return (sync: () => void) => {
    const target = getTarget()

    target.addEventListener(event, sync)

    return () => target.removeEventListener(event, sync)
  }
}

/* @__NO_SIDE_EFFECTS__ */
export function raf(sync: () => void) {
  let frame = requestAnimationFrame(loop)

  function loop() {
    sync()
    frame = requestAnimationFrame(loop)
  }

  return () => cancelAnimationFrame(frame)
}
