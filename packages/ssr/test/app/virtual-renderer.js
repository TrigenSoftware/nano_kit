import { Renderer, headDescriptorToHtml } from '@nano_kit/ssr/renderer'
import { run } from '@nano_kit/store'
import { Page$ } from '@nano_kit/router'
import { routes, pages } from 'virtual:app-index'

function compose($outlet, layout) {
  return `${layout()} > ${$outlet()?.()}`
}

class DumyRenderer extends Renderer {
  constructor(options) {
    super({
      ...options,
      compose
    })
  }

  renderToString(data) {
    let head = ''

    data.head.forEach((descriptor) => {
      if (descriptor.tag !== 'lang' && descriptor.tag !== 'dir') {
        head += headDescriptorToHtml(descriptor)
      }
    })

    const $page = data.injector.get(Page$)

    return `${head}<script>${this.dehydratedScript(data.dehydrated)}</script>${run(data.injector, () => $page()?.default())}`
  }
}

export const renderer = new DumyRenderer({
  base: import.meta.env.BASE_URL,
  manifestPath: import.meta.env.MANIFEST,
  routes,
  pages
})

if (!import.meta.env.VITEST) {
  console.log('Virtual renderer:', renderer)
}
