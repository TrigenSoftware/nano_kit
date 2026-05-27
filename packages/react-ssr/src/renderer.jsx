import { ReactRenderer } from '@nano_kit/react-ssr/renderer'
import {
  routes,
  pages
} from 'virtual:app-index'

export const renderer = new ReactRenderer({
  base: import.meta.env.BASE_URL,
  manifestPath: import.meta.env.MANIFEST,
  inject: import.meta.env.SSR_INJECT,
  routes,
  pages
})
