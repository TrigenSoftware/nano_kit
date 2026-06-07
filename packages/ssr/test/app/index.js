import {
  page,
  layout,
  loadable
} from '@nano_kit/router'
import * as Layout from './layout.js'

export const routes = {
  home: '/',
  about: '/about'
}

export const pages = [
  layout(Layout, [
    page('home', loadable(() => import('./home.js'))),
    page('about', loadable(() => import('./about.js')))
  ])
]

if (!import.meta.env.VITEST) {
  console.log('App index', routes, pages)
}
