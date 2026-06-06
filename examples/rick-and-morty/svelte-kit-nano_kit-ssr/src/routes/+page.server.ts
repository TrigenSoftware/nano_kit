import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = () => {
  // oxlint-disable-next-line eslint/no-magic-numbers
  redirect(301, '/characters')
}
