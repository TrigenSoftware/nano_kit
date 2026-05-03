import { inject } from '@nano_kit/store'
import { Characters$ } from '@/stores/characters'

export function Stores$() {
  const { $characters } = inject(Characters$)

  return [$characters]
}
