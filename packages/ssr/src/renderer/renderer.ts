import {
  type Accessor,
  InjectionContext,
  provide,
  dehydrate,
  run
} from '@nano_kit/store'
import {
  type Routes,
  type HeadDescriptor,
  type RouteLocationRecord,
  type PageRef,
  Location$,
  Navigation$,
  Page$,
  Pages$,
  loadPages,
  virtualNavigation,
  precompose,
  sharedRouter
} from '@nano_kit/router'
import type { VirtualCookieStore } from '@nano_kit/cookie-store'
import type {
  RendererOptions,
  RenderData,
  RenderResult
} from './renderer.types.js'
import { Manifest } from './manifest.js'
import {
  responseRedirect,
  responseStatus
} from './utils.js'

export * from './renderer.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
let cookeStorePromise: Promise<typeof import('@nano_kit/cookie-store')>

/**
 * A base class for renderers. It provides methods to load the manifest, preload the pages, and render the view. The actual rendering logic should be implemented in the subclasses.
 */
export abstract class Renderer extends Manifest {
  #router!: ($location: RouteLocationRecord<Routes>) => Accessor<PageRef<unknown> | null>
  #preloading: Promise<void> | false

  constructor(public readonly options: RendererOptions) {
    super(options)

    this.#preloading = loadPages(options.pages).then(() => {
      precompose(options.pages, options.compose)
      this.#router = sharedRouter(options.pages, options.compose)
      this.#preloading = false
    })
  }

  /**
   * Generates a script to set the dehydrated state on the client.
   * @param dehydrated - The dehydrated state to be sent to the client.
   * @returns A string containing the script to set the dehydrated state on the client.
   */
  dehydratedScript(dehydrated: [string, unknown][]) {
    return `window.__DEHYDRATED__=${JSON.stringify(dehydrated)}`
  }

  /**
   * Prepares the data needed for rendering the view.
   * @param url - The URL for which the view should be rendered.
   * @param cookies - The raw `Cookie` header value from the incoming request.
   * @returns Render data.
   */
  async data(
    url: string,
    cookies?: string
  ): Promise<RenderData> {
    await this.#preloading

    const {
      routes,
      pages,
      cookieStore
    } = this.options
    const [$location, navigation] = virtualNavigation(url, routes)
    const $page = this.#router($location)
    const dependecies = [
      provide(Location$, $location),
      provide(Navigation$, navigation),
      provide(Page$, $page),
      provide(Pages$, pages)
    ]
    let virtualCookieStore: VirtualCookieStore | undefined

    if (cookieStore) {
      const {
        VirtualCookieStore,
        CookieStore$
      } = await (cookeStorePromise ??= import('@nano_kit/cookie-store'))

      virtualCookieStore = new VirtualCookieStore(cookies, url)

      dependecies.push(provide(CookieStore$, virtualCookieStore))
    }

    const context = new InjectionContext(dependecies)
    const page = $page()
    let head: HeadDescriptor[] = []
    let dehydrated: [string, unknown][] = []

    if (page) {
      if (this.options.dehydrate !== false) {
        dehydrated = await dehydrate(page.Stores$!, context)
        head = [
          ...run(context, page.Head$!),
          ...this.getAssetsTags(page.__chunks)
        ]
      } else {
        head = this.getAssetsTags()
      }
    }

    const [statusCode, redirect] = responseStatus($location(), page)
    let setCookieHeaders = null

    if (virtualCookieStore) {
      setCookieHeaders = virtualCookieStore.getSetCookieHeaders()

      if (!setCookieHeaders.length) {
        setCookieHeaders = null
      }
    }

    return {
      page,
      statusCode,
      redirect,
      context,
      head,
      dehydrated,
      setCookieHeaders
    }
  }

  /**
   * Renders the view to a string.
   * This method should be implemented by the subclass.
   * @param data - Render data.
   * @returns A string containing the rendered HTML of the view.
   */
  abstract renderToString(data: RenderData): string | Promise<string>

  /**
   * Renders the view for the given URL and returns the result.
   * @param url - The URL for which the view should be rendered.
   * @param cookies - The raw `Cookie` header value from the incoming request.
   * @returns An object containing the rendered HTML and other render artifacts.
   */
  async render(
    url: string,
    cookies?: string
  ): Promise<RenderResult> {
    const data = await this.data(url, cookies)
    let html: string | null = null

    if (!data.redirect && data.page) {
      html = `<!doctype html>${await this.renderToString(data)}`

      const maybeRedirect = responseRedirect(data.context.get(Location$)())

      if (maybeRedirect) {
        const [statusCode, redirect] = maybeRedirect

        return {
          ...data,
          statusCode,
          redirect,
          html: null
        }
      }
    }

    return {
      ...data,
      html
    }
  }
}
