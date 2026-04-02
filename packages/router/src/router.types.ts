import type {
  InjectionFactory,
  Accessor,
  AnyAccessor,
  WritableSignal
} from '@nano_kit/store'
import type { HeadDescriptor } from './head.types.js'

export type Stores = AnyAccessor[]

export type StoresFactory = InjectionFactory<Stores>

export type Head = HeadDescriptor[]

export type HeadFactory = InjectionFactory<Head>

export interface CacheConditionDescriptor {
  /**
   * A string or an array of strings representing the cache key(s) for the view.
   * Current location href is always included as a cache key by default, so it is not necessary to include it in the returned keys.
   * If not provided, the cache key will be the current location href.
   */
  key?: string | string[]
  /**
   * Expiration time in seconds for the cache entry. If not provided, the cache entry will not expire.
   */
  expires?: number
}

export type CacheCondition = CacheConditionDescriptor | boolean

export type CacheFactory = InjectionFactory<CacheCondition>

export interface PageModule<V> {
  /**
   * Injection factory to get stores to dehydrate for the view while SSR.
   */
  Stores$?: StoresFactory
  /**
   * Injection factory to get head elements for the view.
   */
  Head$?: HeadFactory
  /**
   * Injection factory to get cache conditions for the view. If it returns a falsy value, the view will not be cached.
   */
  Cache$?: CacheFactory
  /**
   * Chunk names attached by plugin for SSR.
   */
  __chunks?: string[]
  /**
   * Response status code for the view. If not provided, the status code will be determined by the presence of the page component (200 if present, 404 if not).
   */
  statusCode?: number
  /**
   * View component.
   */
  default: V | undefined
}

export interface PageRef<V> extends PageModule<V> {
  /**
   * Indicates if the view is loading.
   */
  loading?: boolean
}

export interface ComposedPageRef<V> extends PageRef<V> {
  l?: ComposedPageRef<unknown>
  r?: ComposedPageRef<unknown>
}

export interface LayoutRef<V> extends PageRef<V> {
  r?: {
    l: unknown
    r: WritableSignal<unknown>
  }
}

export type PageRefGetter<V> = (tasks?: Set<Promise<unknown> | null>) => PageRef<V>

export interface PageMatchRef<R extends string | null, P> {
  /**
   * The expected route name to match.
   */
  expected: R
  /**
   * Function to get the view reference for the matched page.
   */
  page: PageRefGetter<P>
}

export interface LayoutMatchRef<R extends string, P, L> {
  /**
   * Function to get the view reference for the layout.
   */
  layout: PageRefGetter<L>
  /**
   * Children match references for nested routes.
   */
  pages: MatchRef<R, P, L>[]
}

export type MatchRef<R extends string, P, L> =
  | PageMatchRef<R, P>
  | PageMatchRef<null, P>
  | LayoutMatchRef<R, P, L>

export type PageModuleLoader<P> = () => Promise<PageModule<P>>

export interface PageModuleRef<P> {
  /**
   * Function to load the view module.
   */
  load: PageRefGetter<P>
}

export type UnknownPageMatchRef = PageMatchRef<string, unknown> | PageMatchRef<null, unknown>

export type UnknownLayoutMatchRef = LayoutMatchRef<string, unknown, unknown>

export type UnknownMatchRef = MatchRef<string, unknown, unknown>

export type UnknownComposer<T = unknown> = ($outlet: Accessor<T>, layout: T) => T
