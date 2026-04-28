import { createFileRoute } from '@tanstack/react-router'
import { episodesOptions } from '#src/stores/episodes'
import { Episodes } from '#src/ui/pages/Episodes'
import { pageFromSearch } from './-utils'

export const Route = createFileRoute('/episodes')({
  validateSearch: (search: Record<string, unknown>) => ({
    page: pageFromSearch(search.page)
  }),
  loaderDeps: ({ search: { page } }) => ({
    page
  }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(episodesOptions(deps.page)),
  component: Episodes
})
