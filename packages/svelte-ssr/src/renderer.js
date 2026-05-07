import { SvelteRenderer } from '@nano_kit/svelte-ssr/renderer'
import {
  routes,
  pages
} from 'virtual:app-index'

export const renderer = new SvelteRenderer({
  base: import.meta.env.BASE_URL,
  manifestPath: import.meta.env.MANIFEST,
  cookieStore: import.meta.env.SSR_COOKIE_STORE,
  routes,
  pages
})
