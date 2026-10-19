import { onMount } from 'svelte'
import { VERSION } from '@sveltejs/kit'
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
  PushHistoryAction,
  ReplaceHistoryAction,
  createCachedMatcher,
  createLocation,
  updateLocation
} from '@nano_kit/router'
import {
  afterNavigate,
  goto
} from '$app/navigation'
import { page } from '$app/state'

/* SvelteKit 3 renamed the `replaceState` option of `goto` to `replace`, and rejects a URL
   that does not resolve to a route, so fall back to a full page load like its links do */
function kitGoto(href: string, replace?: boolean) {
  const options = VERSION < '3'
    ? {
      replaceState: replace
    }
    : {
      replace
    }

  goto(href, options).catch(() => location[replace ? 'replace' : 'assign'](href))
}

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
          kitGoto(location.href)
        }
      }, nextLocation, prevLocation)
    }),
    replace: action((to) => {
      const prevLocation = $location()
      const nextLocation = routerLocation(updateLocation(prevLocation, to, ReplaceHistoryAction))

      navigation.transition((location) => {
        if (location !== null) {
          kitGoto(location.href, true)
        }
      }, nextLocation, prevLocation)
    })
  }

  return [record($location), navigation]
}
