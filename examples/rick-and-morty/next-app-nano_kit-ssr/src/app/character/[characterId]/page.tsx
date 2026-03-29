import { Dehydration } from '@nano_kit/react'
import { NextNavigation } from '@nano_kit/next-router'
import { routes } from '@/stores/router'
import CharacterPage, { Stores$ } from '@/ui/pages/Character'

export default function Page() {
  return (
    <NextNavigation routes={routes}>
      <Dehydration stores={Stores$}>
        <CharacterPage />
      </Dehydration>
    </NextNavigation>
  )
}
