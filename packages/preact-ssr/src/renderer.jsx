import { PreactRenderer } from '@nano_kit/preact-ssr/renderer'
import {
  routes,
  pages
} from 'virtual:app-index'

export const renderer = new PreactRenderer({
  base: import.meta.env.BASE_URL,
  manifestPath: import.meta.env.MANIFEST,
  cookieStore: import.meta.env.SSR_COOKIE_STORE,
  routes,
  pages
})
