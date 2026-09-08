import { toSignal } from '@nano_kit/store'
import { getInject } from '@nano_kit/svelte'
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
  return getInject(Location$)
}

/**
 * Get the navigation API from the injection context.
 * @returns Navigation API.
 */
export function getNavigation() {
  return getInject(Navigation$)
}

/**
 * Get the paths object built from the routes from the injection context.
 * @returns Object with path generators for each route.
 */
export function getPaths() {
  return getInject(Paths$)
}

/**
 * Get the "can go back" signal from the injection context.
 * @returns Signal that returns true if back navigation is possible, false otherwise.
 */
export function getCanGoBack() {
  return toSignal(getInject(CanGoBack$))
}
