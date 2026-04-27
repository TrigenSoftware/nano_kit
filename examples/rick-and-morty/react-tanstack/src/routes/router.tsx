import { createRouter } from '@tanstack/react-router'
import { queryClient } from '#src/queryClient'
import { Route as characterRoute } from './character'
import { Route as charactersRoute } from './characters'
import { Route as episodeRoute } from './episode'
import { Route as episodesRoute } from './episodes'
import { Route as locationRoute } from './location'
import { Route as locationsRoute } from './locations'
import { rootRoute } from './root'
import { Route as indexRoute } from '.'

const routeTree = rootRoute.addChildren([
  indexRoute,
  charactersRoute,
  characterRoute,
  locationsRoute,
  locationRoute,
  episodesRoute,
  episodeRoute
])

export const router = createRouter({
  routeTree,
  context: {
    queryClient
  }
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
