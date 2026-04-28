import { createRoute } from '@tanstack/react-router'
import { charactersOptions } from '#src/stores/characters'
import { rootRoute } from './root'
import { pageFromSearch } from './utils'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/characters',
  validateSearch: (search: Record<string, unknown>) => ({
    page: pageFromSearch(search.page)
  }),
  loaderDeps: ({ search: { page } }) => ({
    page
  }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(charactersOptions(deps.page))
}).lazy(() => import('./characters.lazy').then(d => d.Route))
