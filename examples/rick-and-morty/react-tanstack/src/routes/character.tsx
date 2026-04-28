import { createRoute } from '@tanstack/react-router'
import { idsFromUrls } from '#src/services/api'
import { characterOptions } from '#src/stores/characters'
import { episodesByIdsOptions } from '#src/stores/episodes'
import { rootRoute } from './root'
import { idFromParam } from './utils'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/character/$characterId',
  parseParams: params => ({
    characterId: idFromParam(params.characterId)
  }),
  loader: async ({ context, params }) => {
    const character = await context.queryClient.ensureQueryData(characterOptions(params.characterId))

    await context.queryClient.ensureQueryData(episodesByIdsOptions(idsFromUrls(character.episode)))
  }
}).lazy(() => import('./character.lazy').then(d => d.Route))
