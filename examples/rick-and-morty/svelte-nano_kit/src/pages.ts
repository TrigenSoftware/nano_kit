import {
  loadable,
  layout,
  page
} from '@nano_kit/svelte-router'
import PageLoader from './ui/components/PageLoader.svelte'
import * as MainLayout from './ui/pages/MainLayout.svelte'
import * as HomePage from './ui/pages/Home.svelte'

export const pages = [
  layout(MainLayout, [
    page('home', HomePage),
    page(
      'characters',
      loadable(
        () => import('./ui/pages/Characters.svelte'),
        PageLoader
      )
    ),
    page(
      'character',
      loadable(
        () => import('./ui/pages/Character.svelte'),
        PageLoader
      )
    ),
    page(
      'locations',
      loadable(
        () => import('./ui/pages/Locations.svelte'),
        PageLoader
      )
    ),
    page(
      'location',
      loadable(
        () => import('./ui/pages/Location.svelte'),
        PageLoader
      )
    ),
    page(
      'episodes',
      loadable(
        () => import('./ui/pages/Episodes.svelte'),
        PageLoader
      )
    ),
    page(
      'episode',
      loadable(
        () => import('./ui/pages/Episode.svelte'),
        PageLoader
      )
    )
  ])
]
