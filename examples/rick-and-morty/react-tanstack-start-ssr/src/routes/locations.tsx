import { createFileRoute } from '@tanstack/react-router'
import { locationsOptions } from '#src/stores/locations'
import { Locations } from '#src/ui/pages/Locations'
import { pageFromSearch } from './-utils'

export const Route = createFileRoute('/locations')({
  validateSearch: (search: Record<string, unknown>) => ({
    page: pageFromSearch(search.page)
  }),
  loaderDeps: ({ search: { page } }) => ({
    page
  }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(locationsOptions(deps.page)),
  component: Locations
})
