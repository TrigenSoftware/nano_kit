import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/'
}).lazy(() => import('./index.lazy').then(d => d.Route))
