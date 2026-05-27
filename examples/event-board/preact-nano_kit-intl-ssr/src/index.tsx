import {
  layout,
  loadable,
  page
} from '@nano_kit/preact-router'
import { routes } from './stores/router'
import * as Layout from './ui/pages/Layout'
import './app.css'

declare module '@nano_kit/router' {
  interface AppContext {
    routes: typeof routes
  }
}

export { routes }

export const pages = [
  layout(Layout, [
    page('home', loadable(() => import('./ui/pages/Home'))),
    page('newEvent', loadable(() => import('./ui/pages/NewEvent'))),
    page('event', loadable(() => import('./ui/pages/Event')))
  ])
]
