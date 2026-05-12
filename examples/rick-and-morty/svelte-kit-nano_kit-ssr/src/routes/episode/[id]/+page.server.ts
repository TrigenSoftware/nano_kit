import {
  dehydrate,
  isFlight
} from '@nano_kit/svelte-kit'
import { Stores$ } from '#src/ui/pages/Episode.svelte'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const dehydrated = !isFlight() && await dehydrate(Stores$)

  return {
    dehydrated
  }
}
