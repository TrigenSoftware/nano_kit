import {
  ariaCurrent,
  linkComponent,
  preloadable
} from '@nano_kit/svelte-router'
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
