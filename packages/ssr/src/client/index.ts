import {
  type Accessor,
  InjectionContext,
  provide,
  Hydrator$,
  hydrator
} from '@nano_kit/store'
import {
  type MatchRef,
  type PageRef,
  type RouteLocationRecord,
  type Routes,
  Location$,
  Navigation$,
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
 * Retrieves the dehydrated state from the global window object and returns its hydrator function.
 * @returns A data hydrator function.
 */
export function hydrate() {
  return hydrator(window.__DEHYDRATED__ || [])
}

/**
 * Prepares the client-side context for the application by loading the necessary data and returning an InjectionContext.
 * @returns An InjectionContext containing the dehydrated state, location, navigation and router.
 */
export async function ready(options: ReadyOptions) {
  const {
    routes,
    pages,
    router
  } = options
  const [$location, navigation] = browserNavigation(routes)
  const $page = router($location, pages)
  const context = new InjectionContext([
    provide(Hydrator$, hydrate()),
    provide(Location$, $location),
    provide(Navigation$, navigation),
    provide(Page$, $page),
    provide(Pages$, pages)
  ])

  await loadPage(pages, $location().route)

  return context
}
