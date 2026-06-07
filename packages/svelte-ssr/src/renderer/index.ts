import type {
  Component,
  ComponentInternals
} from 'svelte'
import { render } from 'svelte/server'
import { get } from '@nano_kit/store'
import {
  App,
  compose
} from '@nano_kit/svelte-router'
import { setInjectionContext } from '@nano_kit/svelte'
import {
  type RendererOptions,
  type RenderData,
  ROOT_ID,
  Renderer,
  headDescriptorToHtml
} from '@nano_kit/ssr/renderer'

export * from '@nano_kit/ssr/renderer'

export interface SvelteRendererOptions extends Omit<RendererOptions, 'compose'> {}

/**
 * Base renderer for Svelte applications. Extend this class and implement the `view` method to create an app renderer.
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
    let title: string | undefined
    let lang: string | undefined
    let dir: string | undefined
    let head = ''

    data.head.forEach((descriptor) => {
      if (descriptor.tag === 'lang') {
        lang = get(descriptor.value) || undefined
      } else if (descriptor.tag === 'dir') {
        dir = get(descriptor.value) || undefined
      } else if (descriptor.tag === 'title') {
        title = get(descriptor.value) || undefined
      } else {
        head += headDescriptorToHtml(descriptor)
      }
    })

    if (title) {
      head = `<title>${title}</title>${head}`
    }

    const result = await render(((
      internals: ComponentInternals,
      props: Record<string, never>
    ) => {
      setInjectionContext(data.context)

      return App(internals, props)
    }) as Component)

    return `<html${lang ? ` lang="${lang}"` : ''}${dir ? ` dir="${dir}"` : ''}><head>${head}${result.head}</head><body><div id="${ROOT_ID}">${result.body}</div><script>${this.dehydratedScript(data.dehydrated)}</script></body></html>`
  }
}
