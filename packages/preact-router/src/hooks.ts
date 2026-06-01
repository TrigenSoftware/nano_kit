import {
  signalHook,
  injectHook
} from '@nano_kit/preact'
import {
  CanGoBack$,
  Location$,
  Navigation$,
  Paths$
} from '@nano_kit/router'

/**
 * Subscribe to the current route location from the injector context.
 * @returns Current route location
 */
export const useLocation = /* @__PURE__ */ signalHook(injectHook(Location$))

/**
 * Get the navigation API from the injector context.
 * @returns Navigation API
 */
export const useNavigation = /* @__PURE__ */ injectHook(Navigation$)

/**
 * Get the paths object built from the routes from the injector context.
 * @returns Object with path generators for each route
 */
export const usePaths = /* @__PURE__ */ injectHook(Paths$)

/**
 * Subscribe to the "can go back" accessor from the injector context.
 * @returns Accessor that returns true if back navigation is possible, false otherwise.
 */
export const useCanGoBack = /* @__PURE__ */ signalHook(injectHook(CanGoBack$))
