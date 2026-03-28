import {
  signalHook,
  injectHook
} from '@nano_kit/react'
import {
  Location$,
  Navigation$,
  Paths$
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
