import { ReactRenderer } from '@nano_kit/react-ssr/renderer'
import {
  routes,
  pages
} from './index.js'

export const renderer = new ReactRenderer({
  base: import.meta.env.BASE_URL,
  manifestPath: import.meta.env.MANIFEST,
  routes,
  pages
})
