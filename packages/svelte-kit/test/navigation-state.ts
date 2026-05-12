import type {
  Navigation,
  RouteLocationRecord
} from '@nano_kit/router'

export const navigationRoutes = {
  home: '/',
  about: '/about',
  user: '/user/:id'
} as const

type NavigationRoutes = typeof navigationRoutes

let location: RouteLocationRecord<NavigationRoutes> | undefined
let navigation: Navigation<NavigationRoutes> | undefined

export function setNavigationState(
  nextLocation: RouteLocationRecord<NavigationRoutes>,
  nextNavigation: Navigation<NavigationRoutes>
) {
  location = nextLocation
  navigation = nextNavigation
}

export function resetNavigationState() {
  location = undefined
  navigation = undefined
}

export function getNavigationState() {
  if (!location || !navigation) {
    throw new Error('Navigation fixture is not rendered.')
  }

  return [location, navigation] as const
}
