import type {
  PageModuleLoader,
  PageModuleRef,
  PageMatchRef,
  PageModule,
  MatchRef,
  LayoutMatchRef
} from '@nano_kit/router'
import type { PageComponent } from './types.js'

/**
 * Define a loadable view.
 * @param load - Function that loads the view module
 * @param fallback - Optional fallback view while loading
 * @returns Module reference object
 */
export declare function loadable(
  load: PageModuleLoader<PageComponent>,
  fallback?: PageComponent
): PageModuleRef<PageComponent>

/**
 * Define a page match reference for route matching.
 * @param expected - The expected route name to match
 * @param page - The page module ref to return when matched
 * @returns Page view reference object
 */
export declare function page<R extends string>(
  expected: R,
  page: PageModuleRef<PageComponent>
): PageMatchRef<R, PageComponent>

/**
 * Define a page match reference for route matching.
 * @param expected - The expected route name to match
 * @param page - The page module to return when matched
 * @returns Page view reference object
 */
export declare function page<R extends string>(
  expected: R,
  page: PageModule<PageComponent>
): PageMatchRef<R, PageComponent>

/**
 * Define a page match reference for route matching.
 * @param expected - The expected route name to match
 * @param page - The page component or value to return when matched
 * @returns Page view reference object
 */
export declare function page<R extends string>(
  expected: R,
  page: PageComponent
): PageMatchRef<R, PageComponent>

/**
 * Define a page match reference for not found handling.
 * @param page - The page module ref to return when not found
 * @returns Page view reference object
 */
export declare function notFound(
  page: PageModuleRef<PageComponent>
): PageMatchRef<null, PageComponent>

/**
 * Define a page match reference for not found handling.
 * @param page - The page module to return when not found
 * @returns Page view reference object
 */
export declare function notFound(
  page: PageModule<PageComponent>
): PageMatchRef<null, PageComponent>

/**
 * Define a page match reference for not found handling.
 * @param page - The page component or value to return when not found
 * @returns Page view reference object
 */
export declare function notFound(
  page: PageComponent
): PageMatchRef<null, PageComponent>

/**
 * Define a layout match reference for nested route matching.
 * @param layout - The layout module ref
 * @param pages - Array of page or nested layout match references
 * @returns Layout match reference object
 */
export declare function layout<R extends string>(
  layout: PageModuleRef<PageComponent>,
  pages: MatchRef<R, PageComponent, PageComponent>[]
): LayoutMatchRef<R, PageComponent, PageComponent>

/**
 * Define a layout match reference for nested route matching.
 * @param layout - The layout module
 * @param pages - Array of page or nested layout match references
 * @returns Layout match reference object
 */
export declare function layout<R extends string>(
  layout: PageModule<PageComponent>,
  pages: MatchRef<R, PageComponent, PageComponent>[]
): LayoutMatchRef<R, PageComponent, PageComponent>

/**
 * Define a layout match reference for nested route matching.
 * @param layout - The layout component or value
 * @param pages - Array of page or nested layout match references
 * @returns Layout match reference object
 */
export declare function layout<R extends string>(
  layout: PageComponent,
  pages: MatchRef<R, PageComponent, PageComponent>[]
): LayoutMatchRef<R, PageComponent, PageComponent>

// @ts-expect-error - Override types for better inference
export { loadable, layout, page, notFound } from '@nano_kit/router'
