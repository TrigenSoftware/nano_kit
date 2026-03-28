import {
  createContext,
  useContext,
  useEffect,
  memo
} from 'react'
import type { Accessor } from '@nano_kit/store'
import {
  useSignal,
  useInject,
  useInjectionContext
} from '@nano_kit/react'
import {
  type LayoutMatchRef,
  type PageMatchRef,
  type RouteLocationRecord,
  type Routes,
  type PageRef,
  Page$,
  syncHead,
  router as vanillaRouter
} from '@nano_kit/router'
import type { PageComponent } from './types.js'

const OutletContext = /* @__PURE__ */ createContext<Accessor<PageComponent | null>>(() => null)

/**
 * Renders the nested page component within a layout.
 */
/* @__NO_SIDE_EFFECTS__ */
export function Outlet() {
  const $outlet = useContext(OutletContext)
  const Outlet = useSignal($outlet)

  return Outlet ? <Outlet/> : null
}

export function compose(
  $outlet: Accessor<PageComponent | null>,
  Layout: PageComponent
): PageComponent {
  const { Provider } = OutletContext

  return memo(() => (
    <Provider value={$outlet}>
      <Layout/>
    </Provider>
  ))
}

/**
 * Creates a computed signal that matches the current route against page and layout definitions.
 * Supports nested layouts with composition function for combining layouts with nested content.
 * @param $location - Route match signal containing route and parameters
 * @param pages - Array of page and layout match references
 * @returns Tuple of computed signal containing the matched page or composed layout and function to preload stores
 */
/* @__NO_SIDE_EFFECTS__ */
export function router<R extends Routes, K extends keyof R & string>(
  $location: RouteLocationRecord<R>,
  pages: (
    | PageMatchRef<NoInfer<K>, PageComponent>
    | PageMatchRef<null, PageComponent>
    | LayoutMatchRef<NoInfer<K>, PageComponent, PageComponent>
  )[]
): Accessor<PageRef<PageComponent> | null> {
  return vanillaRouter($location, pages, compose)
}

/**
 * Get page component from the current page match reference signal.
 * @param $page - Signal containing the current page match reference
 * @returns Current page component or null if no match
 */
/* @__NO_SIDE_EFFECTS__ */
export function usePage($page: Accessor<PageRef<PageComponent> | null>) {
  return useSignal($page)?.default
}

/**
 * Get page component from the current page match reference signal within injection context.
 * Should be used inside injection context with page provided.
 * @returns Current page component or null if no match
 */
/* @__NO_SIDE_EFFECTS__ */
export function usePage$() {
  const $page = useInject(Page$)

  return usePage($page)
}

/**
 * App component that renders the current page based on the route match.
 * Should be used inside injection context with page provided.
 * @returns Rendered page component or null if no match
 */
export function App() {
  const Page = usePage$()

  return Page && <Page/>
}

/**
 * Syncs the document head with the current page's head configuration.
 * @param $page - Signal containing the current page match reference
 */
export function useSyncHead($page: Accessor<PageRef<unknown> | null>) {
  useEffect(() => syncHead($page), [$page])
}

/**
 * Syncs the document head with the current page's head configuration within injection context.
 * Should be used inside injection context with page provided.
 */
export function useSyncHead$() {
  const context = useInjectionContext()
  const $page = useInject(Page$)

  useEffect(() => syncHead($page, context), [$page, context])
}
