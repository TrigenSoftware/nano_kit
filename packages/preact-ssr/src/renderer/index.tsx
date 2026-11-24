import { render } from 'preact-render-to-string'
import { InjectionContextProvider } from '@nano_kit/preact'
import {
  App,
  compose
} from '@nano_kit/preact-router'
import {
  type RendererOptions,
  type RenderData,
  Renderer
} from '@nano_kit/ssr/renderer'

export * from '@nano_kit/ssr/renderer'

export interface PreactRendererOptions extends Omit<RendererOptions, 'compose'> {}

/**
 * Renderer for Preact applications. Extend it and override `renderToString` to customize the HTML output.
 */
export class PreactRenderer extends Renderer {
  declare public readonly options: PreactRendererOptions & RendererOptions

  constructor(options: PreactRendererOptions) {
    super({
      ...options,
      compose
    })
  }

  renderToString(data: RenderData) {
    return this.document(data, render(
      <InjectionContextProvider context={data.context}>
        <App />
      </InjectionContextProvider>
    ))
  }
}
