import {
  page,
  layout,
  loadable
} from '@nano_kit/router'
import * as Layout from './layout.js'
import * as Teapot from './teapot.js'

export const routes = {
  home: '/',
  about: '/about',
  gone: '/gone',
  teapot: '/teapot',
  garden: '/garden'
}

export const pages = [
  layout(Layout, [
    page('home', loadable(() => import('./home.js'))),
    page('about', loadable(() => import('./about.js'))),
    page('gone', loadable(() => import('./gone.js'))),
    page('teapot', Teapot),
    page('garden', loadable(() => import('./garden/index.js')))
  ])
]

if (!import.meta.env.VITEST) {
  console.log('App index', routes, pages)
}
