import { provide } from '@nano_kit/store'
import {
  CookieStore,
  LocationNavigation$,
  serverNavigation,
  setDehydrationContext
} from '@nano_kit/svelte-kit'
import { CookieStore$ } from '@nano_kit/platform-web'
import { routes } from '#src/stores/router'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = ({ cookies }) => {
  const contextRef = setDehydrationContext([
    provide(LocationNavigation$, serverNavigation(routes)),
    provide(CookieStore$, new CookieStore(cookies))
  ])

  return {
    contextRef
  }
}
