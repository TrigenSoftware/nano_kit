import {
  Renderer,
  headDescriptorToHtml
} from '@nano_kit/ssr/renderer'
import {
  get,
  run
} from '@nano_kit/store'
import { Page$ } from '@nano_kit/router'
import {
  routes,
  pages
} from './index.js'

function compose($outlet, layout) {
  return () => `${layout()} > ${$outlet()?.()}`
}

class DumyRenderer extends Renderer {
  constructor(options) {
    super({
      ...options,
      compose
    })
  }

  renderToString(data) {
    let title
    let head = ''

    data.head.forEach((descriptor) => {
      if (descriptor.tag === 'title') {
        title = get(descriptor.value)
      } else if (descriptor.tag !== 'lang' && descriptor.tag !== 'dir') {
        head += headDescriptorToHtml(descriptor)
      }
    })

    if (title) {
      head = `<title>${title}</title>${head}`
    }

    const $page = data.context.get(Page$)

    return `${head}<script>${this.dehydratedScript(data.dehydrated)}</script>${run(data.context, () => $page()?.default())}`
  }
}

export const renderer = new DumyRenderer({
  base: import.meta.env.BASE_URL,
  manifestPath: import.meta.env.MANIFEST,
  routes,
  pages
})

if (!import.meta.env.VITEST) {
  console.log('Renderer:', renderer)
}
