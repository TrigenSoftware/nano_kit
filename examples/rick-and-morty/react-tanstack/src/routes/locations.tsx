import { createRoute } from '@tanstack/react-router'
import { locationsOptions } from '#src/stores/locations'
import { rootRoute } from './root'
import { pageFromSearch } from './utils'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/locations',
  validateSearch: (search: Record<string, unknown>) => ({
    page: pageFromSearch(search.page)
  }),
  loaderDeps: ({ search: { page } }) => ({
    page
  }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(locationsOptions(deps.page))
}).lazy(() => import('./locations.lazy').then(d => d.Route))
