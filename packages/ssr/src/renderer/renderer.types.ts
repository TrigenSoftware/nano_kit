import type { InjectionContext } from '@nano_kit/store'
import type {
  HeadDescriptor,
  PageRef,
  Routes,
  UnknownComposer,
  UnknownMatchRef
} from '@nano_kit/router'
import type { ManifestOptions } from './manifest.types.js'
import type {
  SUCCESS_STATUS,
  MOVED_PERMANENTLY_STATUS,
  FOUND_STATUS,
  NOT_FOUND_STATUS
} from './constants.js'

/**
 * Response status codes that the renderer can produce.
 */
export type ResponseStatusCode =
  | typeof SUCCESS_STATUS
  | typeof MOVED_PERMANENTLY_STATUS
  | typeof FOUND_STATUS
  | typeof NOT_FOUND_STATUS

export interface KnownHeaders {
  cookie?: string
  acceptLanguage?: string
  userAgent?: string
}

export interface RendererOptions extends ManifestOptions {
  routes: Routes
  pages: UnknownMatchRef[]
  /**
   * Function to compose layouts with outlet content.
   * This should be set by the subclass before calling the `render` method.
   */
  compose: UnknownComposer<any>
  dehydrate?: boolean
  inject?: {
    /**
     * Whether to inject a CookieStore-compatible virtual implementation during SSR.
     */
    cookieStore?: boolean
    /**
     * Weather to detect and inject the browser locale from the `Accept-Language` header.
     */
    browserLocale?: boolean
    /**
     * Whether to inject the browser user agent from the `User-Agent` header.
     */
    userAgent?: boolean
  }
}

export interface RenderViewData {
  head: HeadDescriptor[]
  dehydratedScript: string
}

export interface RenderData {
  context: InjectionContext
  head: HeadDescriptor[]
  dehydrated: [string, unknown][]
  statusCode: ResponseStatusCode
  redirect: string | null
  page: PageRef<unknown> | null
  setCookieHeaders: string[] | null
}

export interface RenderResult extends RenderData {
  html: string | null
}
