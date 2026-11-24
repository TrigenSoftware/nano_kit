import type {
  Component,
  ComponentInternals
} from 'svelte'
import { render } from 'svelte/server'
import {
  App,
  compose
} from '@nano_kit/svelte-router'
import { setInjectionContext } from '@nano_kit/svelte'
import {
  type RendererOptions,
  type RenderData,
  Renderer
} from '@nano_kit/ssr/renderer'

export * from '@nano_kit/ssr/renderer'

export interface SvelteRendererOptions extends Omit<RendererOptions, 'compose'> {}

/**
 * Renderer for Svelte applications. Extend it and override `renderToString` to customize the HTML output.
 */
export class SvelteRenderer extends Renderer {
  declare public readonly options: SvelteRendererOptions & RendererOptions

  constructor(options: SvelteRendererOptions) {
    super({
      ...options,
      compose
    })
  }

  async renderToString(data: RenderData) {
    const result = await render(((
      internals: ComponentInternals,
      props: Record<string, never>
    ) => {
      setInjectionContext(data.context)

      return App(internals, props)
    }) as Component)

    return this.document(data, result.body, result.head)
  }
}
