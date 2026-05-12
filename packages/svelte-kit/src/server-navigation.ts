import { redirect } from '@sveltejs/kit'
import {
  type Navigation,
  type RouteLocationRecord,
  type Routes,
  PermanentReplaceHistoryAction,
  virtualNavigation
} from '@nano_kit/router'
// eslint-disable-next-line import/extensions
import { getRequestEvent } from '$app/server'

const TemporaryRedirectStatus = 307
const PermanentRedirectStatus = 308

/**
 * Creates a navigation for the current SvelteKit server request.
 * Navigation actions (`push`, `replace`) trigger SvelteKit `redirect()` on the server.
 * @param routes - Route definitions for the application.
 * @returns Tuple of location signal and navigation object.
 */
/* @__NO_SIDE_EFFECTS__ */
export function serverNavigation<const R extends Routes = Routes>(
  routes: R = {} as R
): [RouteLocationRecord<R>, Navigation<R>] {
  const event = getRequestEvent()
  const [$location, navigation] = virtualNavigation(
    `${event.url.pathname}${event.url.search}${event.url.hash}`,
    routes
  )
  const superTransition = navigation.transition

  navigation.transition = (fn, nextLocation, prevLocation) => {
    superTransition(fn, nextLocation, prevLocation)

    if (nextLocation) {
      redirect(
        nextLocation.action === PermanentReplaceHistoryAction
          ? PermanentRedirectStatus
          : TemporaryRedirectStatus,
        nextLocation.href
      )
    }
  }

  return [$location, navigation]
}
