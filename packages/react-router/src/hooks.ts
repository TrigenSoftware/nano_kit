'use client'
import { useSyncExternalStore } from 'react'
import { noop } from '@nano_kit/store'
import {
  useSignal,
  signalHook,
  injectHook
} from '@nano_kit/react'
import {
  Location$,
  Navigation$,
  Paths$,
  Title$
} from '@nano_kit/router'

/**
 * Subscribe to the current route location from the injection context.
 * @returns Current route location
 */
export const useLocation = /* @__PURE__ */ signalHook(injectHook(Location$))

/**
 * Get the navigation API from the injection context.
 * @returns Navigation API
 */
export const useNavigation = /* @__PURE__ */ injectHook(Navigation$)

/**
 * Get the paths object built from the routes from the injection context.
 * @returns Object with path generators for each route
 */
export const usePaths = /* @__PURE__ */ injectHook(Paths$)

// The snapshots below differ only between the server and the client, there is nothing to subscribe to
function subscribeToNothing() {
  return noop
}

/**
 * Subscribe to whether back navigation is possible from the injection context.
 * The server knows no history, so it is false there and while the page hydrates, as in the server markup, and updates right after.
 * @returns True if back navigation is possible, false otherwise.
 */
export function useCanGoBack() {
  const canGoBack = useSignal(useNavigation().$canGoBack)
  const hydrated = useSyncExternalStore(subscribeToNothing, () => true, () => false)

  return canGoBack && hydrated
}

/**
 * Subscribe to the title of the current page from the injection context.
 * @returns Current page title, or an empty string while the head has none
 */
export const useTitle = /* @__PURE__ */ signalHook(injectHook(Title$))
