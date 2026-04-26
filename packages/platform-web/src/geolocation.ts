import {
  external,
  mountable,
  onStart
} from '@nano_kit/store'

/**
 * A signal containing live geolocation updates from `watchPosition`.
 */
export const $geolocation = /* @__PURE__ */ external<GeolocationPosition | GeolocationPositionError | undefined>(($position) => {
  if (typeof window === 'undefined') {
    return
  }

  onStart(mountable($position), () => {
    const watchId = navigator.geolocation.watchPosition($position, $position)

    return () => navigator.geolocation.clearWatch(watchId)
  })
})

/**
 * A signal containing a single geolocation snapshot from `getCurrentPosition`.
 */
export const $staticGeolocation = /* @__PURE__ */ external<GeolocationPosition | GeolocationPositionError | undefined>(($position) => {
  if (typeof window === 'undefined') {
    return
  }

  onStart(mountable($position), () => {
    navigator.geolocation.getCurrentPosition($position, $position)
  })
})
