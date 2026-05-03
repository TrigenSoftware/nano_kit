import { inject } from '@nano_kit/store'
import { Location$ } from '@/stores/locations'
import { Residents$ } from '@/stores/characters'

export function Stores$() {
  const { $location } = inject(Location$)
  const { $residents } = inject(Residents$)

  return [$location, $residents]
}
