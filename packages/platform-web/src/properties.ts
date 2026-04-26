import { type WritableSignal } from '@nano_kit/store'
import {
  on,
  raf,
  reactiveValue
} from './core.js'

const resize = /* @__PURE__ */ on(() => window, 'resize')
const scroll = /* @__PURE__ */ on(() => window, 'scroll')

/**
 * A signal containing the current window inner width.
 */
export const $innerWidth: WritableSignal<number> = /* @__PURE__ */ reactiveValue(
  () => window.innerWidth,
  resize,
  NaN
)

/**
 * A signal containing the current window inner height.
 */
export const $innerHeight: WritableSignal<number> = /* @__PURE__ */ reactiveValue(
  () => window.innerHeight,
  resize,
  NaN
)

/**
 * A signal containing the current window outer width.
 */
export const $outerWidth: WritableSignal<number> = /* @__PURE__ */ reactiveValue(
  () => window.outerWidth,
  resize,
  NaN
)

/**
 * A signal containing the current window outer height.
 */
export const $outerHeight: WritableSignal<number> = /* @__PURE__ */ reactiveValue(
  () => window.outerHeight,
  resize,
  NaN
)

/**
 * A signal containing the current horizontal scroll position.
 */
export const $scrollX: WritableSignal<number> = /* @__PURE__ */ reactiveValue(
  () => window.scrollX,
  scroll,
  NaN
)

/**
 * A signal containing the current vertical scroll position.
 */
export const $scrollY: WritableSignal<number> = /* @__PURE__ */ reactiveValue(
  () => window.scrollY,
  scroll,
  NaN
)

/**
 * A signal containing the current left position of the browser window.
 */
export const $screenLeft: WritableSignal<number> = /* @__PURE__ */ reactiveValue(
  () => window.screenLeft,
  raf,
  NaN
)

/**
 * A signal containing the current top position of the browser window.
 */
export const $screenTop: WritableSignal<number> = /* @__PURE__ */ reactiveValue(
  () => window.screenTop,
  raf,
  NaN
)

/**
 * A signal containing the current device pixel ratio.
 */
export const $devicePixelRatio: WritableSignal<number> = /* @__PURE__ */ reactiveValue(
  () => window.devicePixelRatio,
  (sync) => {
    let mq: MediaQueryList | null = null
    const destroy = () => {
      if (mq) {
        mq = mq.onchange = null
      }
    }
    const next = () => {
      destroy()
      sync()
      mq = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
      mq.onchange = next
    }

    next()

    return destroy
  },
  NaN
)

/**
 * A signal containing the current network online state.
 */
export const $networkOnline: WritableSignal<boolean> = /* @__PURE__ */ reactiveValue(
  () => navigator.onLine,
  (sync) => {
    window.addEventListener('online', sync)
    window.addEventListener('offline', sync)

    return () => {
      window.removeEventListener('online', sync)
      window.removeEventListener('offline', sync)
    }
  },
  true
)

/**
 * A signal containing the current page visibility state.
 */
export const $pageVisible: WritableSignal<boolean> = /* @__PURE__ */ reactiveValue(
  () => !document.hidden,
  on(() => document, 'visibilitychange'),
  true
)

/**
 * A signal containing the current screen orientation type.
 */
export const $screenOrientation: WritableSignal<OrientationType | undefined> = /* @__PURE__ */ reactiveValue(
  () => screen.orientation.type,
  on(() => screen.orientation, 'change')
)

/**
 * A signal containing the current fullscreen state.
 */
export const $fullscreen: WritableSignal<boolean> = /* @__PURE__ */ reactiveValue(
  () => document.fullscreenElement !== null,
  on(() => document, 'fullscreenchange'),
  false
)
