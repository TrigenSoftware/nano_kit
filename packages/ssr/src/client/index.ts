import {
  type Accessor,
  Injector,
  provide,
  Hydrator$,
  StaticHydrator
} from '@nano_kit/store'
import {
  type MatchRef,
  type PageRef,
  type RouteLocationRecord,
  type Routes,
  LocationNavigation$,
  Page$,
  Pages$,
  browserNavigation,
  loadPage
} from '@nano_kit/router'

export * from '../constants.js'

export interface ReadyOptions {
  routes: Routes
  pages: MatchRef<string, any, any>[]
  router(
    $location: RouteLocationRecord<Routes>,
    pages: MatchRef<string, any, any>[]
  ): Accessor<PageRef<any> | null>
}

declare global {
  interface Window {
    __DEHYDRATED__: [string, unknown][]
  }
}

/**
 * Retrieves the dehydrated state from the global window object and returns its hydrator.
 * @returns A data hydrator.
 */
export function hydrator() {
  return new StaticHydrator(window.__DEHYDRATED__ || [])
}

/**
 * Prepares the client-side injector for the application by loading the necessary data and returning an Injector.
 * @returns An Injector containing the dehydrated state, location, navigation and router.
 */
export async function ready(options: ReadyOptions) {
  const {
    routes,
    pages,
    router
  } = options
  const locationNavigation = browserNavigation(routes)
  const [$location] = locationNavigation
  const $page = router($location, pages)
  const injector = new Injector([
    provide(Hydrator$, hydrator()),
    provide(LocationNavigation$, locationNavigation),
    provide(Page$, $page),
    provide(Pages$, pages)
  ])

  await loadPage(pages, $location().route)

  return injector
}
