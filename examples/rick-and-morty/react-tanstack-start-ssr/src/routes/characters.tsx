import { createFileRoute } from '@tanstack/react-router'
import { charactersOptions } from '#src/stores/characters'
import { Characters } from '#src/ui/pages/Characters'
import { pageFromSearch } from './-utils'

export const Route = createFileRoute('/characters')({
  validateSearch: (search: Record<string, unknown>) => ({
    page: pageFromSearch(search.page)
  }),
  loaderDeps: ({ search: { page } }) => ({
    page
  }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(charactersOptions(deps.page)),
  component: Characters
})
