import { createRoute } from '@tanstack/react-router'
import { episodeCharactersOptions } from '#src/stores/characters'
import { episodeOptions } from '#src/stores/episodes'
import { rootRoute } from './root'
import { idFromParam } from './utils'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/episode/$episodeId',
  parseParams: params => ({
    episodeId: idFromParam(params.episodeId)
  }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(episodeOptions(params.episodeId))

    await context.queryClient.ensureQueryData(episodeCharactersOptions(params.episodeId))
  }
}).lazy(() => import('./episode.lazy').then(d => d.Route))
