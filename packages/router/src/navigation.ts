import {
  type KeysOf,
  type ValueOfKey,
  type ReadableSignal,
  type WritableSignal,
  atIndex,
  onMount,
  readonly,
  record,
  signal,
  batch,
  updateList,
  action,
  computed,
  untracked,
  mountable
} from '@nano_kit/store'
import type {
  Location,
  Routes
} from './types.js'
import type {
  Navigation,
  RouteLocation,
  RouteLocationRecord,
  RouteMatch
} from './navigation.types.js'
import {
  PopHistoryAction,
  PushHistoryAction,
  ReplaceHistoryAction
} from './constants.js'
import {
  composeMatchers,
  createLocation,
  parseHref,
  removeTrailingSlash,
  updateLocation
} from './utils.js'

export * from './navigation.types.js'

function createPatternRegex(pattern: string) {
  return new RegExp(`^${
    removeTrailingSlash(pattern)
      // Escape all special regex characters
      .replace(/[\s!#$()+,.:<=?[\\\]^{|}]/g, '\\$&')
      // /:param? -> (?:/(?<param>(?<=/)[^/]+))?
      .replace(/\/\\:(\w+)\\\?/g, '(?:/(?<$1>(?<=/)[^/]+))?')
      // /:param -> /(?<param>[^/]+)
      .replace(/\/\\:(\w+)/g, '/(?<$1>[^/]+)')
      // /* - > (?:/(?<wildcard>.+))?$
      .replace(/\/\*$/g, '(?:/(?<wildcard>.+))?$')
  }/?$`, 'i')
}

function patternMatcher(this: RegExp, route: string, path: string) {
  const matches = path.match(this)

  if (!matches) {
    return null
  }

  const params: Record<string, string> = {}

  if (matches.groups) {
    Object.entries(matches.groups).forEach(([key, value]) => {
      params[key] = value
        ? decodeURIComponent(value)
        : ''
    })
  }

  return {
    route,
    params
  }
}

const nomatch = {
  route: null,
  params: {}
}

function createMatcher(routes: Routes) {
  return composeMatchers(Object.entries(routes).map(
    ([route, pattern]) => patternMatcher.bind(
      createPatternRegex(pattern),
      route
    )
  ), nomatch)
}

// For SSR purposes, create matcher once
const matcherCache = new WeakMap<Routes, ReturnType<typeof createMatcher>>()

export function createCachedMatcher(routes: Routes) {
  let matcher = matcherCache.get(routes)

  if (!matcher) {
    matcher = createMatcher(routes)
    matcherCache.set(routes, matcher)
  }

  return matcher
}

function applyBrowserLocation({ href, action }: Location) {
  if (action === PushHistoryAction) {
    history.pushState(null, '', href)
  } else if (action === ReplaceHistoryAction) {
    history.replaceState(null, '', href)
  }
}

/**
 * Creates a browser navigation instance with route matching.
 * @param routes - Routes object defining path patterns.
 * @returns Tuple of current location signal and navigation methods object.
 */
/* @__NO_SIDE_EFFECTS__ */
export function browserNavigation<const R extends Routes = {}>(
  routes: R = {} as R
): [RouteLocationRecord<R>, Navigation<R>] {
  const match = createCachedMatcher(routes)
  const routerLocation = (location: Location) => ({
    ...location,
    ...match(location.pathname)
  }) as RouteLocation<R>
  const $location = mountable(signal(
    routerLocation(createLocation(location))
  ))
  const update = (location: RouteLocation<R> | null) => {
    if (location !== null) {
      applyBrowserLocation(location)
      $location(location)
    }
  }
  const maybeUpdate = (nextLocation: Location) => {
    const location = $location()

    if (
      location.href !== nextLocation.href
      // Always update if there is a hash change
      // (to allow scrolling to anchors on the same page)
      || nextLocation.hash.length > 1
    ) {
      const { action } = nextLocation
      const nextRouteLocation = routerLocation(nextLocation)

      if (action === null || action === PopHistoryAction) {
        update(nextRouteLocation)
      } else {
        navigation.transition(
          update,
          nextRouteLocation,
          location
        )
      }
    }
  }
  const sync = (event?: unknown) => {
    maybeUpdate(
      createLocation(
        location,
        event ? PopHistoryAction : null
      )
    )
  }
  const navigation: Navigation<R> = {
    routes,
    transition(fn, nextLocation) {
      fn(nextLocation)
    },
    get length() {
      return history.length
    },
    back: action(() => {
      navigation.transition(history.back, null, $location())
    }),
    forward: action(() => {
      navigation.transition(history.forward, null, $location())
    }),
    push: action((to) => {
      maybeUpdate(
        updateLocation(location, to, PushHistoryAction)
      )
    }),
    replace: action((to) => {
      maybeUpdate(
        updateLocation(location, to, ReplaceHistoryAction)
      )
    })
  }

  onMount($location, () => {
    sync()

    window.addEventListener('popstate', sync)

    return () => {
      window.removeEventListener('popstate', sync)
    }
  })

  return [record(readonly($location)), navigation]
}

/**
 * Creates a virtual navigation instance with route matching.
 * @param initialPath - Initial path for the virtual navigation (default: '/').
 * @param routes - Routes object defining path patterns.
 * @returns Tuple of current location signal and navigation methods object.
 */
/* @__NO_SIDE_EFFECTS__ */
export function virtualNavigation<const R extends Routes = {}>(
  initialPath = '/',
  routes: R = {} as R
): [RouteLocationRecord<R>, Navigation<R>] {
  const match = createCachedMatcher(routes)
  const routerLocation = (location: Location) => ({
    ...location,
    ...match(location.pathname)
  }) as RouteLocation<R>
  const $history = signal(
    [routerLocation(createLocation(parseHref(initialPath)))]
  )
  const $activeIndex = signal(0)
  const $location = mountable(atIndex($history, $activeIndex) as WritableSignal<RouteLocation<R>>)
  const go = (steps: number) => {
    const newIndex = Math.max(0, Math.min(
      $history().length - 1,
      $activeIndex() + steps
    ))

    batch(() => {
      $activeIndex(newIndex)
      $location((location): RouteLocation<R> => ({
        ...location,
        action: PopHistoryAction
      }))
    })
  }
  const back = () => go(-1)
  const forward = () => go(1)
  const update = (location: RouteLocation<R> | null) => {
    if (location !== null) {
      if (location.action === PushHistoryAction) {
        const activeIndex = $activeIndex()
        const nextIndex = activeIndex + 1

        batch(() => {
          updateList($history, (history) => {
            history.splice(nextIndex, history.length - activeIndex - 1, location)
          })
          $activeIndex(nextIndex)
        })
      } else if (location.action === ReplaceHistoryAction) {
        $location(location)
      }
    }
  }
  const maybeUpdate = (nextLocation: Location, location: RouteLocation<R>) => {
    if (
      location.href !== nextLocation.href
      // Always update if there is a hash change
      // (to allow scrolling to anchors on the same page)
      || nextLocation.hash.length > 1
    ) {
      const nextRouteLocation = routerLocation(nextLocation)

      navigation.transition(
        update,
        nextRouteLocation,
        location
      )
    }
  }
  const navigation: Navigation<R> = {
    routes,
    transition(fn, location) {
      fn(location)
    },
    get length() {
      return untracked($history).length
    },
    back: action(() => {
      navigation.transition(back, null, $location())
    }),
    forward: action(() => {
      navigation.transition(forward, null, $location())
    }),
    push: action((to) => {
      const location = $location()

      maybeUpdate(
        updateLocation(location, to, PushHistoryAction),
        location
      )
    }),
    replace: action((to) => {
      const location = $location()

      maybeUpdate(
        updateLocation(location, to, ReplaceHistoryAction),
        location
      )
    })
  }

  return [record(readonly($location)), navigation]
}

/**
 * Computed signal for a specific route parameter.
 * @param $location - Current location signal.
 * @param key - Parameter key to extract.
 * @param parser - Optional parser function for the parameter value.
 * @returns Computed signal of the parameter value.
 */
/* @__NO_SIDE_EFFECTS__ */
export function routeParam<
  const R extends Routes,
  M extends RouteMatch<R> = RouteMatch<R>,
  K extends KeysOf<M['params']> = KeysOf<M['params']>,
  V extends ValueOfKey<M['params'], K> = ValueOfKey<M['params'], K>,
  T = V | undefined
>(
  $location: RouteLocationRecord<R>,
  key: K,
  parser: (value: NoInfer<V> | undefined) => T = _ => _ as unknown as T
): ReadableSignal<T> {
  const { $params } = $location as RouteLocationRecord<{}>

  return computed(() => parser(($params() as Record<K, V>)[key]))
}
