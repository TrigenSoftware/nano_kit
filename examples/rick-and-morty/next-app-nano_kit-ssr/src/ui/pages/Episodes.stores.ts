import { inject } from '@nano_kit/store'
import { Episodes$ } from '@/stores/episodes'

export function Stores$() {
  const { $episodes } = inject(Episodes$)

  return [$episodes]
}
