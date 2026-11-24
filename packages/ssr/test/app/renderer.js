import { Renderer } from '@nano_kit/ssr/renderer'
import { run } from '@nano_kit/store'
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
    const $page = data.context.get(Page$)

    return this.document(data, run(data.context, () => $page()?.default()))
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
