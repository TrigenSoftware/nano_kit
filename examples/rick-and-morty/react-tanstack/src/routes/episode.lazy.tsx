import { createLazyRoute } from '@tanstack/react-router'
import { Episode } from '#src/ui/pages/Episode'

export const Route = createLazyRoute('/episode/$episodeId')({
  component: Episode
})
