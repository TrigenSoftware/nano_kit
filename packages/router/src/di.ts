import {
  type Accessor,
  type ReadableSignal,
  DependencyNotFound,
  inject,
  getContext
} from '@nano_kit/store'
import type {
  AppRoutes,
  AppComponent,
  AppNavigation
} from './di.types.js'
import type {
  MatchRef,
  PageRef
} from './router.js'
import {
  type RouteLocationRecord,
  canGoBack
} from './navigation.js'
import {
  type Paths,
  buildPaths
} from './paths.js'
import { pageTitle } from './head.js'

export type * from './di.types.js'

/**
 * Global injection token for the current route location record and navigation API.
 */
export function LocationNavigation$(): [RouteLocationRecord<AppRoutes>, AppNavigation] {
  throw new DependencyNotFound('LocationNavigation$')
}

/**
 * Global injection token for the current route location record.
 * @returns Current route location record, which includes the current path, params, and query.
 */
export function Location$(): RouteLocationRecord<AppRoutes> {
  return inject(LocationNavigation$)[0]
}

/**
 * Global injection token for the navigation API.
 * @returns Navigation API, which includes methods for navigating to different routes and managing the navigation history.
 */
export function Navigation$(): AppNavigation {
  return inject(LocationNavigation$)[1]
}

/**
 * Global injection token for the current page match reference.
 */
export function Page$(): Accessor<PageRef<AppComponent> | null> {
  throw new DependencyNotFound('Page$')
}

/**
 * Global injection token for the router page refs.
 */
export function Pages$(): MatchRef<string, AppComponent, AppComponent>[] {
  throw new DependencyNotFound('Pages$')
}

/**
 * Global injection token for the paths object built from the routes.
 * @returns Object with path generators for each route
 */
export function Paths$(): Paths<AppRoutes> {
  const navigation = inject(Navigation$)

  return buildPaths(navigation.routes)
}

/**
 * Global injection token for the "can go back" accessor.
 * @returns Accessor that returns true if back navigation is possible, false otherwise.
 */
export function CanGoBack$(): Accessor<boolean> {
  const $location = inject(Location$)
  const navigation = inject(Navigation$)

  return canGoBack($location, navigation)
}

/**
 * Global injection token for the title of the current page.
 * The head factories are resolved within the injection context the token is first injected in.
 * @returns Signal of the title, or of an empty string while the head has none.
 */
export function Title$(): ReadableSignal<string> {
  const context = getContext()
  const $page = inject(Page$)

  return pageTitle($page, context)
}
