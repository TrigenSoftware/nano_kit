import { createRoute } from '@tanstack/react-router'
import { characterOptions } from '#src/stores/characters'
import { characterEpisodesOptions } from '#src/stores/episodes'
import { rootRoute } from './root'
import { idFromParam } from './utils'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/character/$characterId',
  parseParams: params => ({
    characterId: idFromParam(params.characterId)
  }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(characterOptions(params.characterId))

    await context.queryClient.ensureQueryData(characterEpisodesOptions(params.characterId))
  }
}).lazy(() => import('./character.lazy').then(d => d.Route))
