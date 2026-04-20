import { render } from 'preact-render-to-string'
import { get } from '@nano_kit/store'
import { InjectionContextProvider } from '@nano_kit/preact'
import {
  compose,
  App
} from '@nano_kit/preact-router'
import {
  type RendererOptions,
  type RenderData,
  ROOT_ID,
  headDescriptorToHtml,
  Renderer
} from '@nano_kit/ssr/renderer'

export * from '@nano_kit/ssr/renderer'

export interface PreactRendererOptions extends Omit<RendererOptions, 'compose'> {}

/**
 * Base renderer for Preact applications. Extend this class and implement the `view` method to create an app renderer.
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
    let title: string | undefined
    let lang: string | undefined
    let dir: 'ltr' | 'rtl' | 'auto' | undefined
    let head = ''

    data.head.forEach((descriptor) => {
      if (descriptor.tag === 'lang') {
        lang = get(descriptor.value) || undefined
      } else if (descriptor.tag === 'dir') {
        dir = get(descriptor.value) as typeof dir
      } else if (descriptor.tag === 'title') {
        title = get(descriptor.value) || undefined
      } else {
        head += headDescriptorToHtml(descriptor)
      }
    })

    if (title) {
      head = `<title>${title}</title>${head}`
    }

    return render(
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
