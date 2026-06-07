import { renderToString } from 'react-dom/server'
import { get } from '@nano_kit/store'
import { InjectionContextProvider } from '@nano_kit/react'
import {
  App,
  compose
} from '@nano_kit/react-router'
import {
  type RendererOptions,
  type RenderData,
  ROOT_ID,
  Renderer,
  headDescriptorToHtml
} from '@nano_kit/ssr/renderer'

export * from '@nano_kit/ssr/renderer'

export interface ReactRendererOptions extends Omit<RendererOptions, 'compose'> {}

/**
 * Base renderer for React applications. Extend this class and implement the `view` method to create an app renderer.
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

    return renderToString(
      <html
        lang={lang}
        dir={dir}
      >
        <head
          dangerouslySetInnerHTML={{
            __html: head
          }}
        />
        <body>
          <div id={ROOT_ID}>
            <InjectionContextProvider context={data.context}>
              <App />
            </InjectionContextProvider>
          </div>
          <script
            dangerouslySetInnerHTML={{
              __html: this.dehydratedScript(data.dehydrated)
            }}
          />
        </body>
      </html>
    )
  }
}
