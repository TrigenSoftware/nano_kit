import { inject } from '@nano_kit/store'
import { Locations$ } from '@/stores/locations'

export function Stores$() {
  const { $locations } = inject(Locations$)

  return [$locations]
}
