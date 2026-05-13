import {
  dehydrate,
  isFlight
} from '@nano_kit/svelte-kit'
import { Stores$ } from '#src/ui/pages/Home.svelte'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => ({
  dehydrated: !isFlight() && await dehydrate(Stores$)
})
