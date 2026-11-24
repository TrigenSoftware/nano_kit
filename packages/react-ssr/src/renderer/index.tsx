import { renderToString } from 'react-dom/server'
import { InjectionContextProvider } from '@nano_kit/react'
import {
  App,
  compose
} from '@nano_kit/react-router'
import {
  type RendererOptions,
  type RenderData,
  Renderer
} from '@nano_kit/ssr/renderer'

export * from '@nano_kit/ssr/renderer'

export interface ReactRendererOptions extends Omit<RendererOptions, 'compose'> {}

/**
 * Renderer for React applications. Extend it and override `renderToString` to customize the HTML output.
 */
export class ReactRenderer extends Renderer {
  declare public readonly options: ReactRendererOptions & RendererOptions

  constructor(options: ReactRendererOptions) {
    super({
      ...options,
      compose
    })
  }

  renderToString(data: RenderData) {
    // Only the root that the client hydrates goes through React:
    // `useId` builds ids from the path in the tree, and the document around the app would change them.
    return this.document(data, renderToString(
      <InjectionContextProvider context={data.context}>
        <App />
      </InjectionContextProvider>
    ))
  }
}
