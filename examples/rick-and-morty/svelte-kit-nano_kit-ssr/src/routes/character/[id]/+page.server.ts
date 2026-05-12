import { dehydrate } from '@nano_kit/svelte-kit'
import { Stores$ } from '#src/ui/pages/Character.svelte'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ parent }) => {
  await parent()

  const dehydrated = await dehydrate(Stores$)

  return {
    dehydrated
  }
}
