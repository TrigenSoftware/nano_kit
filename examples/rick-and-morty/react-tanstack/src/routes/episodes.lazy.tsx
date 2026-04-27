import { createLazyRoute } from '@tanstack/react-router'
import { Episodes } from '#src/ui/pages/Episodes'

export const Route = createLazyRoute('/episodes')({
  component: Episodes
})
