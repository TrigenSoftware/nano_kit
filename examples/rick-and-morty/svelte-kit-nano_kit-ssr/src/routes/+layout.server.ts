import { provide } from '@nano_kit/store'
import {
  Location$,
  Navigation$,
  serverNavigation,
  setDehydrationContext
} from '@nano_kit/svelte-kit'
import { routes } from '#src/stores/router'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = () => {
  const [location, navigation] = serverNavigation(routes)

  setDehydrationContext([
    provide(Location$, location),
    provide(Navigation$, navigation)
  ])

  return {}
}
