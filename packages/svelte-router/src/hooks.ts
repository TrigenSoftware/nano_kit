import { onMount } from 'svelte'
import {
  computed,
  signal
} from '@nano_kit/store'
import { getInject } from '@nano_kit/svelte'
import {
  Location$,
  Navigation$,
  Paths$,
  Title$
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
 * The server knows no history, so it is false there and until the component mounts, as in the server markup, and updates right after.
 * @returns Signal that returns true if back navigation is possible, false otherwise.
 */
export function getCanGoBack() {
  const { $canGoBack } = getNavigation()
  const $mounted = signal(false)

  onMount(() => $mounted(true))

  return computed(() => $canGoBack() && $mounted())
}

/**
 * Get the title signal of the current page from the injection context.
 * @returns Signal containing the current page title, or an empty string while the head has none.
 */
export function getTitle() {
  return getInject(Title$)
}
