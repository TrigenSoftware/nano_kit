import { inject } from '@nano_kit/store'
import { Character$ } from '@/stores/characters'
import { CharacterEpisodes$ } from '@/stores/episodes'

export function Stores$() {
  const { $character } = inject(Character$)
  const { $characterEpisodes } = inject(CharacterEpisodes$)

  return [$character, $characterEpisodes]
}
