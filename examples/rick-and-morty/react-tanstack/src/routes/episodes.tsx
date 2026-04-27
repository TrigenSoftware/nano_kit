import { createRoute } from '@tanstack/react-router'
import { episodesOptions } from '#src/stores/episodes'
import { rootRoute } from './root'
import { pageFromSearch } from './utils'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/episodes',
  validateSearch: (search: Record<string, unknown>) => ({
    page: pageFromSearch(search.page)
  }),
  loaderDeps: ({ search: { page } }) => ({
    page
  }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(episodesOptions(deps.page))
}).lazy(() => import('./episodes.lazy').then(d => d.Route))
