'use client'
import {
  useRouter,
  usePathname,
  useSearchParams
} from 'next/navigation'
import {
  useEffect,
  useLayoutEffect,
  useMemo
} from 'react'
import { useInjectionContext } from '@nano_kit/react'
import {
  signal,
  record,
  mountable,
  action,
  computed
} from '@nano_kit/store'
import {
  type Routes,
  type RouteLocationRecord,
  type RouteLocation,
  type Navigation,
  type Location,
  Location$,
  PushHistoryAction,
  ReplaceHistoryAction,
  createCachedMatcher,
  createLocation,
  updateLocation
} from '@nano_kit/router'

const SEARCH_PARAMS_FALLBACK = '?__searchParamsFallback__=true'

export function useShouldProvideNextNavigation() {
  const context = useInjectionContext()
  let isSearchParamsAvailable = true

  try {
    useSearchParams()
  } catch {
    isSearchParamsAvailable = false
  }

  const location = context?.get(Location$, true)

  return !location || location.$search() === SEARCH_PARAMS_FALLBACK && isSearchParamsAvailable
}

function useRouteLocation<const R extends Routes = Routes>(
  routes: R = {} as R
) {
  const pathname = usePathname()
  let search = ''

  try {
    search = useSearchParams().toString()
  } catch {
    search = SEARCH_PARAMS_FALLBACK
  }

  const [
    $pathname,
    $search,
    $hash,
    $location,
    $locationRecord,
    routerLocation
  ] = useMemo(() => {
    const match = createCachedMatcher(routes)
    const routerLocation = (location: Location) => ({
      ...location,
      ...match(location.pathname)
    }) as RouteLocation<R>
    const $pathname = signal(pathname)
    const $search = signal(search)
    const $hash = signal(typeof location !== 'undefined' ? location.hash : '')
    const $location = mountable(computed(() => {
      const pathname = $pathname()
      const search = $search()
      const hash = $hash()

      return routerLocation(createLocation({
        pathname,
        search: search ? `?${search}` : '',
        hash
      }))
    }))
    const $locationRecord = record($location)

    return [
      $pathname,
      $search,
      $hash,
      $location,
      $locationRecord,
      routerLocation
    ] as const
  }, [])

  // Update as earler as possible
  useLayoutEffect(() => {
    $pathname(pathname)
    $search(search)
  }, [pathname, search])

  useEffect(() => {
    const sync = () => $hash(location.hash)

    window.addEventListener('hashchange', sync)

    return () => {
      window.removeEventListener('hashchange', sync)
    }
  }, [])

  return [$location, $locationRecord, routerLocation] as const
}

/**
 * Creates a navigation for client components based on the current Next.js route.
 * @param routes - Route definitions for the application.
 * @returns Tuple of location signal and navigation object.
 */
export function useNextNavigation<const R extends Routes = Routes>(
  routes: R = {} as R
): [RouteLocationRecord<R>, Navigation<R>] {
  const [$location, $locationRecord, routerLocation] = useRouteLocation(routes)
  const nextRouter = useRouter()
  const navigation = useMemo((): Navigation<R> => ({
    routes,
    transition(fn, nextLocation) {
      fn(nextLocation)
    },
    get length() {
      return typeof history !== 'undefined' ? history.length : 1
    },
    back: action(() => {
      navigation.transition(nextRouter.back, null, $location())
    }),
    forward: action(() => {
      navigation.transition(nextRouter.forward, null, $location())
    }),
    push: action((to) => {
      const prevLocation = $location()
      const nextLocation = routerLocation(updateLocation(prevLocation, to, PushHistoryAction))

      navigation.transition((location) => {
        if (location !== null) {
          nextRouter.push(location.href)
        }
      }, nextLocation, prevLocation)
    }),
    replace: action((to) => {
      const prevLocation = $location()
      const nextLocation = routerLocation(updateLocation(prevLocation, to, ReplaceHistoryAction))

      navigation.transition((location) => {
        if (location !== null) {
          nextRouter.replace(location.href)
        }
      }, nextLocation, prevLocation)
    })
  }), [])

  return [$locationRecord, navigation]
}
