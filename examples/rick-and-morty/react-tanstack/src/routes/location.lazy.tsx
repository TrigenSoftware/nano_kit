import { createLazyRoute } from '@tanstack/react-router'
import { Location } from '#src/ui/pages/Location'

export const Route = createLazyRoute('/location/$locationId')({
  component: Location
})
