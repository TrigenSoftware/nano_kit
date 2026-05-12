import { onMount } from 'svelte'
import {
  action,
  computed,
  mountable,
  record,
  signal
} from '@nano_kit/store'
import {
  type Location,
  type Navigation,
  type RouteLocation,
  type RouteLocationRecord,
  type Routes,
  createCachedMatcher,
  createLocation,
  updateLocation,
  PushHistoryAction,
  ReplaceHistoryAction
} from '@nano_kit/router'
import {
  afterNavigate,
  goto
// eslint-disable-next-line import/extensions
} from '$app/navigation'
// eslint-disable-next-line import/extensions
import { page } from '$app/state'

/**
 * Creates a navigation for SvelteKit components based on the current SvelteKit page.
 * @param routes - Route definitions for the application.
 * @returns Tuple of location signal and navigation object.
 */
/* @__NO_SIDE_EFFECTS__ */
export function getKitNavigation<const R extends Routes = Routes>(
  routes: R = {} as R
): [RouteLocationRecord<R>, Navigation<R>] {
  const match = createCachedMatcher(routes)
  const routerLocation = (location: Location) => ({
    ...location,
    ...match(location.pathname)
  }) as RouteLocation<R>
  const $url = signal(page.url)
  const $location = mountable(computed(() => routerLocation(createLocation($url()))))
  const sync = () => $url(page.url)

  afterNavigate(sync)

  onMount(() => {
    window.addEventListener('hashchange', sync)

    return () => {
      window.removeEventListener('hashchange', sync)
    }
  })

  const navigation: Navigation<R> = {
    routes,
    transition(fn, nextLocation) {
      fn(nextLocation)
    },
    get length() {
      return typeof history !== 'undefined' ? history.length : 1
    },
    back: action(() => {
      navigation.transition(() => history.back(), null, $location())
    }),
    forward: action(() => {
      navigation.transition(() => history.forward(), null, $location())
    }),
    push: action((to) => {
      const prevLocation = $location()
      const nextLocation = routerLocation(updateLocation(prevLocation, to, PushHistoryAction))

      navigation.transition((location) => {
        if (location !== null) {
          void goto(location.href)
        }
      }, nextLocation, prevLocation)
    }),
    replace: action((to) => {
      const prevLocation = $location()
      const nextLocation = routerLocation(updateLocation(prevLocation, to, ReplaceHistoryAction))

      navigation.transition((location) => {
        if (location !== null) {
          void goto(location.href, {
            replaceState: true
          })
        }
      }, nextLocation, prevLocation)
    })
  }

  return [record($location), navigation]
}
