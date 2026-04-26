import {
  type WritableSignal,
  external,
  mountable,
  onStart
} from '@nano_kit/store'

/**
 * Creates a signal backed by `window.matchMedia(...)`.
 * @param query - Media query string.
 * @param fallback - Fallback value used during server-side rendering.
 * @returns A signal containing the current media query match state.
 */
/* @__NO_SIDE_EFFECTS__ */
export function mediaQuery(query: string, fallback?: boolean): WritableSignal<boolean | undefined> {
  return external<boolean | undefined>(($matches, ops) => {
    if (typeof window === 'undefined') {
      $matches(fallback)
      return
    }

    const mq = window.matchMedia(query)
    const sync = () => $matches(mq.matches)

    onStart(mountable($matches), () => {
      mq.onchange = sync

      return () => mq.onchange = null
    })

    ops.get = () => (sync(), $matches())
  })
}
