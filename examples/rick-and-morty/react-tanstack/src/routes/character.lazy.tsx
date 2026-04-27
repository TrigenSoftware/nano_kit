import { createLazyRoute } from '@tanstack/react-router'
import { Character } from '#src/ui/pages/Character'

export const Route = createLazyRoute('/character/$characterId')({
  component: Character
})
