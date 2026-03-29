import { inject } from '@nano_kit/store'
import { Episode$ } from '@/stores/episodes'
import { Residents$ } from '@/stores/characters'

export function Stores$() {
  const { $episode } = inject(Episode$)
  const { $residents } = inject(Residents$)

  return [$episode, $residents]
}
