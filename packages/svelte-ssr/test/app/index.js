import {
  page,
  layout,
  loadable
} from '@nano_kit/svelte-router'
import Layout from './layout.svelte'

export const routes = {
  home: '/',
  about: '/about'
}

export const pages = [
  layout(Layout, [
    page('home', loadable(() => import('./home.svelte'))),
    page('about', loadable(() => import('./about.svelte')))
  ])
]
