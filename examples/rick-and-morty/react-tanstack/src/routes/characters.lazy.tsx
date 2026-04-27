import { createLazyRoute } from '@tanstack/react-router'
import { Characters } from '#src/ui/pages/Characters'

export const Route = createLazyRoute('/characters')({
  component: Characters
})
