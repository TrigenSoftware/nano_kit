import { createFileRoute } from '@tanstack/react-router'
import { episodeCharactersOptions } from '#src/stores/characters'
import { episodeOptions } from '#src/stores/episodes'
import { Episode } from '#src/ui/pages/Episode'
import { idFromParam } from './-utils'

export const Route = createFileRoute('/episode/$episodeId')({
  params: {
    parse: params => ({
      episodeId: idFromParam(params.episodeId)
    }),
    stringify: params => ({
      episodeId: String(params.episodeId)
    })
  },
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(episodeOptions(params.episodeId))

    await context.queryClient.ensureQueryData(episodeCharactersOptions(params.episodeId))
  },
  component: Episode
})
