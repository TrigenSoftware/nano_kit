import {
  inject,
  toSignal
} from '@nano_kit/store'
import {
  CanGoBack$,
  Location$,
  Navigation$,
  Paths$
} from '@nano_kit/router'

/**
 * Get the current route location from the injection context.
 * @returns Current route location signal.
 */
export function getLocation() {
  return inject(Location$)
}

/**
 * Get the navigation API from the injection context.
 * @returns Navigation API.
 */
export function getNavigation() {
  return inject(Navigation$)
}

/**
 * Get the paths object built from the routes from the injection context.
 * @returns Object with path generators for each route.
 */
export function getPaths() {
  return inject(Paths$)
}

/**
 * Get the "can go back" signal from the injection context.
 * @returns Signal that returns true if back navigation is possible, false otherwise.
 */
export function getCanGoBack() {
  return toSignal(inject(CanGoBack$))
}
