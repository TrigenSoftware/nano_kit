import { provide } from '@nano_kit/store'
import {
  LocationNavigation$,
  serverNavigation,
  setDehydrationContext
} from '@nano_kit/svelte-kit'
import { routes } from '#src/stores/router'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = () => {
  const contextRef = setDehydrationContext([
    provide(LocationNavigation$, serverNavigation(routes))
  ])

  return {
    contextRef
  }
}
