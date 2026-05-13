import { dehydrate } from '@nano_kit/svelte-kit'
import { Stores$ } from '#src/ui/pages/Logout.svelte'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ parent }) => {
  await parent()
  await dehydrate(Stores$)

  return {}
}
