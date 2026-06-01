import { provide } from '@nano_kit/store'
import {
  LocationNavigation$,
  serverNavigation,
  setDehydrationInjector
} from '@nano_kit/svelte-kit'
import { routes } from '#src/stores/router'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = () => {
  const injectorRef = setDehydrationInjector([
    provide(LocationNavigation$, serverNavigation(routes))
  ])

  return {
    injectorRef
  }
}
