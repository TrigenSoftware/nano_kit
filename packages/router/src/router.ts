import {
  type Accessor,
  computed,
  signal
} from '@nano_kit/store'
import type { Routes } from './types.js'
import type { RouteLocationRecord } from './navigation.types.js'
import type {
  PageMatchRef,
  LayoutMatchRef,
  MatchRef,
  PageModuleLoader,
  PageModuleRef,
  PageRef,
  LayoutRef,
  PageRefGetter,
  UnknownLayoutMatchRef,
  UnknownMatchRef,
  UnknownPageMatchRef,
  UnknownComposer,
  PageModule,
  ComposedPageRef
} from './router.types.js'
import { composeMatchers } from './utils.js'

export * from './router.types.js'

type Composed = (layout: LayoutRef<unknown>, page: ComposedPageRef<unknown>) => PageRef<unknown>

type UnknownMatcher = (route: string | null) => PageRef<unknown> | null

/**
 * Define a loadable view.
 * @param load - Function that loads the view module
 * @param fallback - Optional fallback view while loading
 * @returns Module reference object
 */
/* @__ NO_SIDE_EFFECTS __ - temporary disabled, see https://github.com/rolldown/rolldown/issues/9074 */
export function loadable<const V>(
  load: PageModuleLoader<V>,
  fallback?: V
): PageModuleRef<V> {
  const $viewRef = signal<PageRef<V>>({
    default: fallback,
    loading: true
  })
  const init = (tasks?: Set<Promise<unknown> | null>) => {
    const promise = load().then(module => $viewRef({
      ...module,
      loading: false
    }))

    tasks?.add(promise)
  }
  let initialized = false

  return {
    load(tasks) {
      if (!initialized) {
        initialized = true
        init(tasks)
      }

      return $viewRef()
    }
  }
}

function isLoadable<C = unknown>(ref: unknown): ref is PageModuleRef<C> {
  return typeof (ref as PageModuleRef<C>)?.load === 'function'
}

function isModule<C = unknown>(ref: unknown): ref is PageModule<C> {
  return (ref as PageModule<C>)?.default !== undefined
}

function getViewRefGetter<C>(
  page: C | PageModule<C> | PageModuleRef<C>,
  extra?: Partial<PageModule<C>>
): PageRefGetter<C> {
  let getter: PageRefGetter<C>

  if (isLoadable(page)) {
    getter = page.load
  } else {
    const ref = isModule(page)
      ? {
        ...extra,
        ...page
      }
      : {
        ...extra,
        default: page
      }

    getter = () => ref
  }

  return getter
}

/**
 * Define a page module reference for explicit module handling.
 * @param module - The page module to reference
 * @returns The same page module reference for correct type inference
 */
export function asModule<P>(module: PageModule<P>): PageModule<P> {
  return module
}

/**
 * Define a page match reference for route matching.
 * @param expected - The expected route name to match
 * @param page - The page module ref to return when matched
 * @returns Page view reference object
 */
export function page<R extends string, const P>(
  expected: R,
  page: PageModuleRef<P>
): PageMatchRef<R, P>

/**
 * Define a page match reference for route matching.
 * @param expected - The expected route name to match
 * @param page - The page module to return when matched
 * @returns Page view reference object
 */
export function page<R extends string, const P>(
  expected: R,
  page: PageModule<P>
): PageMatchRef<R, P>

/**
 * Define a page match reference for route matching.
 * @param expected - The expected route name to match
 * @param page - The page component or value to return when matched
 * @returns Page view reference object
 */
export function page<R extends string, const P>(
  expected: R,
  page: P
): PageMatchRef<R, P>

/* @__NO_SIDE_EFFECTS__ */
export function page<R extends string, const P>(
  expected: R,
  page: P | PageModuleRef<P>
): PageMatchRef<R, P> {
  return {
    expected,
    page: getViewRefGetter(page)
  }
}

/**
 * Define a page match reference for not found handling.
 * @param page - The page module ref to return when not found
 * @returns Page view reference object
 */
export function notFound<const P>(
  page: PageModuleRef<P>
): PageMatchRef<null, P>

/**
 * Define a page match reference for not found handling.
 * @param page - The page module to return when not found
 * @returns Page view reference object
 */
export function notFound<const P>(
  page: PageModule<P>
): PageMatchRef<null, P>

/**
 * Define a page match reference for not found handling.
 * @param page - The page component or value to return when not found
 * @returns Page view reference object
 */
export function notFound<const P>(
  page: P
): PageMatchRef<null, P>

/* @__NO_SIDE_EFFECTS__ */
export function notFound<const P>(
  page: P | PageModuleRef<P>
): PageMatchRef<null, P> {
  return {
    expected: null,
    page: getViewRefGetter(page, {
      statusCode: 404
    })
  }
}

/**
 * Define a layout match reference for nested route matching.
 * @param layout - The layout module ref
 * @param pages - Array of page or nested layout match references
 * @returns Layout match reference object
 */
export function layout<R extends string, P, const L>(
  layout: PageModuleRef<L>,
  pages: MatchRef<R, P, L>[]
): LayoutMatchRef<R, P, L>

/**
 * Define a layout match reference for nested route matching.
 * @param layout - The layout module
 * @param pages - Array of page or nested layout match references
 * @returns Layout match reference object
 */
export function layout<R extends string, P, const L>(
  layout: PageModule<L>,
  pages: MatchRef<R, P, L>[]
): LayoutMatchRef<R, P, L>

/**
 * Define a layout match reference for nested route matching.
 * @param layout - The layout component or value
 * @param pages - Array of page or nested layout match references
 * @returns Layout match reference object
 */
export function layout<R extends string, P, const L>(
  layout: L,
  pages: MatchRef<R, P, L>[]
): LayoutMatchRef<R, P, L>

/* @__NO_SIDE_EFFECTS__ */
export function layout(
  layout: unknown,
  pages: UnknownMatchRef[]
) {
  return {
    layout: getViewRefGetter(layout),
    pages
  }
}

function createMatcher(
  pages: UnknownMatchRef[],
  composed: Composed
): UnknownMatcher {
  return composeMatchers(pages.map(
    ref => ('expected' in ref
      ? createPageMatcher(ref)
      : createLayoutMatcher(ref, composed))
  ))
}

function createPageMatcher({ expected, page }: UnknownPageMatchRef): UnknownMatcher {
  return (route: string | null) => (route === expected ? page() : null)
}

function createLayoutMatcher(
  { layout, pages }: UnknownLayoutMatchRef,
  composed: Composed
): UnknownMatcher {
  const match = createMatcher(pages, composed)

  return (route: string | null) => {
    const ref = match(route)

    if (ref) {
      const layoutRef = layout()

      if (layoutRef.loading || !layoutRef.default) {
        return layoutRef
      }

      return composed(layoutRef, ref)
    }

    return null
  }
}

function createComposed(compose: UnknownComposer | undefined): Composed {
  return (layoutRef: LayoutRef<unknown>, pageRef: ComposedPageRef<unknown>) => {
    if (!layoutRef.r) {
      const $outlet = signal(pageRef.default)

      layoutRef.r = {
        l: compose?.($outlet, layoutRef.default),
        r: $outlet
      }
    } else {
      layoutRef.r.r(() => pageRef.default)
    }

    if (!pageRef.l) {
      pageRef.l = {
        ...layoutRef,
        default: layoutRef.r.l,
        r: pageRef
      }
    }

    return pageRef.l
  }
}

/**
 * Creates a shared router factory.
 * @param pages - Array of page and layout match references
 * @returns Router factory function that takes a location signal and returns page accessor
 */
export function sharedRouter<R extends Routes, K extends keyof R & string, P>(
  pages: (
    | PageMatchRef<NoInfer<K>, P>
    | PageMatchRef<null, P>
  )[]
): ($location: RouteLocationRecord<R>) => Accessor<PageRef<P> | null>

/**
 * Creates a shared router factory.
 * @param pages - Array of page and layout match references
 * @param compose - Function to compose layouts with outlet content
 * @returns Router factory function that takes a location signal and returns page accessor
 */
export function sharedRouter<R extends Routes, K extends keyof R & string, P, N, L, C>(
  pages: (
    | PageMatchRef<NoInfer<K>, P>
    | PageMatchRef<null, P>
    | LayoutMatchRef<NoInfer<K>, N, L>
  )[],
  compose: ($outlet: Accessor<N | null>, layout: L) => C
): ($location: RouteLocationRecord<R>) => Accessor<PageRef<P | C> | null>

/* @__NO_SIDE_EFFECTS__ */
export function sharedRouter(
  pages: UnknownMatchRef[],
  compose?: UnknownComposer
): ($location: RouteLocationRecord<Routes>) => Accessor<PageRef<unknown> | null> {
  const composed = createComposed(compose)
  let match: UnknownMatcher = route => (match = createMatcher(pages, composed))(route)

  return ($location) => {
    const { $route } = $location
    const $page = computed(() => match($route()))

    return $page
  }
}

/**
 * Creates a computed signal that matches the current route against page definitions.
 * @param $location - Route match signal containing route and parameters
 * @param pages - Array of page match references
 * @returns Accessor with matched page or null.
 */
export function router<R extends Routes, K extends keyof R & string, P>(
  $location: RouteLocationRecord<R>,
  pages: (
    | PageMatchRef<NoInfer<K>, P>
    | PageMatchRef<null, P>
  )[]
): Accessor<PageRef<P> | null>

/**
 * Creates a computed signal that matches the current route against page and layout definitions.
 * Supports nested layouts with composition function for combining layouts with outlet content.
 * @param $location - Route match signal containing route and parameters
 * @param pages - Array of page and layout match references
 * @param compose - Function to compose layouts with outlet content
 * @returns Accessor with matched page or null.
 */
export function router<R extends Routes, K extends keyof R & string, P, N, L, C>(
  $location: RouteLocationRecord<R>,
  pages: (
    | PageMatchRef<NoInfer<K>, P>
    | PageMatchRef<null, P>
    | LayoutMatchRef<NoInfer<K>, N, L>
  )[],
  compose: ($outlet: Accessor<N | null>, layout: L) => C
): Accessor<PageRef<P | C> | null>

/* @__NO_SIDE_EFFECTS__ */
export function router(
  $location: RouteLocationRecord<Routes>,
  pages: UnknownMatchRef[],
  compose?: UnknownComposer
): Accessor<PageRef<unknown> | null> {
  return sharedRouter(pages, compose!)($location)
}
