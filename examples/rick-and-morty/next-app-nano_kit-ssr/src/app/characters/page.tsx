import { StaticDehydration } from '@nano_kit/react'
import { NextNavigation } from '@nano_kit/next-router'
import { routes } from '@/stores/router'
import CharactersPage from '@/ui/pages/Characters'
import { Stores$ } from '@/ui/pages/Characters.stores'

export default function Page() {
  return (
    <NextNavigation routes={routes}>
      <StaticDehydration stores={Stores$}>
        <CharactersPage />
      </StaticDehydration>
    </NextNavigation>
  )
}
