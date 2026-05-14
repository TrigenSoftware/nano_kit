import { provide } from '@nano_kit/store'
import {
  CookieStore,
  Location$,
  Navigation$,
  serverNavigation,
  setDehydrationContext
} from '@nano_kit/svelte-kit'
import { CookieStore$ } from '@nano_kit/platform-web'
import { routes } from '#src/stores/router'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = ({ cookies }) => {
  const [location, navigation] = serverNavigation(routes)
  const contextRef = setDehydrationContext([
    provide(Location$, location),
    provide(Navigation$, navigation),
    provide(CookieStore$, new CookieStore(cookies))
  ])

  return {
    contextRef
  }
}
