import { provide } from '@nano_kit/store'
import {
  CookieStore,
  LocationNavigation$,
  serverNavigation,
  setDehydrationInjector
} from '@nano_kit/svelte-kit'
import { CookieStore$ } from '@nano_kit/platform-web'
import { routes } from '#src/stores/router'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = ({ cookies }) => {
  const injectorRef = setDehydrationInjector([
    provide(LocationNavigation$, serverNavigation(routes)),
    provide(CookieStore$, new CookieStore(cookies))
  ])

  return {
    injectorRef
  }
}
