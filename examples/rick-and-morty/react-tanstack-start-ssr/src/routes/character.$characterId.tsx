import { createFileRoute } from '@tanstack/react-router'
import { idsFromUrls } from '#src/services/api'
import { characterOptions } from '#src/stores/characters'
import { episodesByIdsOptions } from '#src/stores/episodes'
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
    const character = await context.queryClient.ensureQueryData(characterOptions(params.characterId))

    await context.queryClient.ensureQueryData(episodesByIdsOptions(idsFromUrls(character.episode)))
  },
  component: Character
})
