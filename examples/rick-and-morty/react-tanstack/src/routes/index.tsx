import {
  createRoute,
  redirect
} from '@tanstack/react-router'
import { rootRoute } from './root'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({
      to: '/characters',
      search: {
        page: 1
      },
      replace: true
    })
  }
})
