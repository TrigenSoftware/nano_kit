import type { Injector } from '@nano_kit/store'
import type {
  HeadDescriptor,
  PageRef,
  Routes,
  UnknownComposer,
  UnknownMatchRef
} from '@nano_kit/router'
import type { ManifestOptions } from './manifest.types.js'

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
  injector: Injector
  head: HeadDescriptor[]
  dehydrated: [string, unknown][]
  statusCode: number
  redirect: string | null
  page: PageRef<unknown> | null
  setCookieHeaders: string[] | null
}

export interface RenderResult extends RenderData {
  html: string | null
}
