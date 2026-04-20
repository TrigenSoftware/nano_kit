import { PreactRenderer } from '@nano_kit/preact-ssr/renderer'
import { routes, pages } from './index.js'

export const renderer = new PreactRenderer({
  base: import.meta.env.BASE_URL,
  manifestPath: import.meta.env.MANIFEST,
  routes,
  pages
})
