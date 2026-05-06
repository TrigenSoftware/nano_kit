import { createFileRoute } from '@tanstack/react-router'
import { characterOptions } from '#src/stores/characters'
import { characterEpisodesOptions } from '#src/stores/episodes'
import { Character } from '#src/ui/pages/Character'
import { idFromParam } from './-utils'

export const Route = createFileRoute('/character/$characterId')({
  params: {
    parse: params => ({
      characterId: idFromParam(params.characterId)
    }),
    stringify: params => ({
      characterId: String(params.characterId)
    })
  },
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(characterOptions(params.characterId))

    await context.queryClient.ensureQueryData(characterEpisodesOptions(params.characterId))
  },
  component: Character
})
