import {
  linkComponent,
  preloadable,
  ariaCurrent
} from '@nano_kit/react-router'
import {
  $location,
  navigation,
  paths
} from '#src/stores/router'
import { pages } from '#src/pages'

export const Link = linkComponent(navigation, paths, [
  preloadable(() => pages, true),
  ariaCurrent($location)
])
