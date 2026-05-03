import { createRoute } from '@tanstack/react-router'
import { locationResidentsOptions } from '#src/stores/characters'
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
    await context.queryClient.ensureQueryData(locationOptions(params.locationId))

    await context.queryClient.ensureQueryData(locationResidentsOptions(params.locationId))
  }
}).lazy(() => import('./location.lazy').then(d => d.Route))
