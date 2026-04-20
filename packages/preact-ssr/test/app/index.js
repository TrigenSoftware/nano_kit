import { page, layout, loadable } from '@nano_kit/router'
import * as Layout from './layout.jsx'

export const routes = {
  home: '/',
  about: '/about'
}

export const pages = [
  layout(Layout, [
    page('home', loadable(() => import('./home.jsx'))),
    page('about', loadable(() => import('./about.jsx')))
  ])
]
