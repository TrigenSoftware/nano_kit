import { createFileRoute } from '@tanstack/react-router'
import { idsFromUrls } from '#src/services/api'
import { charactersByIdsOptions } from '#src/stores/characters'
import { locationOptions } from '#src/stores/locations'
import { Location } from '#src/ui/pages/Location'
import { idFromParam } from './-utils'

export const Route = createFileRoute('/location/$locationId')({
  params: {
    parse: params => ({
      locationId: idFromParam(params.locationId)
    }),
    stringify: params => ({
      locationId: String(params.locationId)
    })
  },
  loader: async ({ context, params }) => {
    const location = await context.queryClient.ensureQueryData(locationOptions(params.locationId))

    await context.queryClient.ensureQueryData(charactersByIdsOptions(idsFromUrls(location.residents)))
  },
  component: Location
})
