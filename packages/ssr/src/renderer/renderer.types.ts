import type { InjectionContext } from '@nano_kit/store'
import type {
  HeadDescriptor,
  PageRef,
  Routes,
  UnknownComposer,
  UnknownMatchRef
} from '@nano_kit/router'
import type { ManifestOptions } from './manifest.types.js'

export interface RendererOptions extends ManifestOptions {
  routes: Routes
  pages: UnknownMatchRef[]
  /**
   * Function to compose layouts with outlet content.
   * This should be set by the subclass before calling the `render` method.
   */
  compose: UnknownComposer<any>
  dehydrate?: boolean
}

export interface RenderViewData {
  head: HeadDescriptor[]
  dehydratedScript: string
}

export interface RenderData {
  context: InjectionContext
  head: HeadDescriptor[]
  dehydrated: [string, unknown][]
  statusCode: number
  redirect: string | null
  page: PageRef<unknown> | null
}

export interface RenderResult extends RenderData {
  html: string | null
}
