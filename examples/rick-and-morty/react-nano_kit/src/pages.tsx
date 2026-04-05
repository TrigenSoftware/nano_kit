import {
  layout,
  page,
  loadable
} from '@nano_kit/react-router'
import { Spinner } from './ui/components/Spinner'
import { MainLayout } from './ui/pages/MainLayout'
import HomePage from './ui/pages/Home'

export const pages = [
  layout(MainLayout, [
    page('home', HomePage),
    page(
      'characters',
      loadable(
        () => import('./ui/pages/Characters'),
        () => <Spinner>Loading characters page...</Spinner>
      )
    ),
    page(
      'character',
      loadable(
        () => import('./ui/pages/Character'),
        () => <Spinner>Loading character page...</Spinner>
      )
    ),
    page(
      'locations',
      loadable(
        () => import('./ui/pages/Locations'),
        () => <Spinner>Loading locations page...</Spinner>
      )
    ),
    page(
      'location',
      loadable(
        () => import('./ui/pages/Location'),
        () => <Spinner>Loading location page...</Spinner>
      )
    ),
    page(
      'episodes',
      loadable(
        () => import('./ui/pages/Episodes'),
        () => <Spinner>Loading episodes page...</Spinner>
      )
    ),
    page(
      'episode',
      loadable(
        () => import('./ui/pages/Episode'),
        () => <Spinner>Loading episode page...</Spinner>
      )
    )
  ])
]
