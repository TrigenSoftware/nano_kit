import { SvelteRenderer } from '@nano_kit/svelte-ssr/renderer'
import {
  routes,
  pages
} from './index.js'

export const renderer = new SvelteRenderer({
  base: import.meta.env.BASE_URL,
  manifestPath: import.meta.env.MANIFEST,
  routes,
  pages
})
