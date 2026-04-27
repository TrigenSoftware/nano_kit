import { createLazyRoute } from '@tanstack/react-router'
import { Locations } from '#src/ui/pages/Locations'

export const Route = createLazyRoute('/locations')({
  component: Locations
})
