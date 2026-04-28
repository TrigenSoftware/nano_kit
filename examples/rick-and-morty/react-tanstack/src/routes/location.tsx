import { createRoute } from '@tanstack/react-router'
import { idsFromUrls } from '#src/services/api'
import { charactersByIdsOptions } from '#src/stores/characters'
import { locationOptions } from '#src/stores/locations'
import { rootRoute } from './root'
import { idFromParam } from './utils'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/location/$locationId',
  parseParams: params => ({
    locationId: idFromParam(params.locationId)
  }),
  loader: async ({ context, params }) => {
    const location = await context.queryClient.ensureQueryData(locationOptions(params.locationId))

    await context.queryClient.ensureQueryData(charactersByIdsOptions(idsFromUrls(location.residents)))
  }
}).lazy(() => import('./location.lazy').then(d => d.Route))
