import { Dehydration } from '@nano_kit/react'
import { NextNavigation } from '@nano_kit/next-router'
import { routes } from '@/stores/router'
import EpisodePage, { Stores$ } from '@/ui/pages/Episode'

export default function Page() {
  return (
    <NextNavigation routes={routes}>
      <Dehydration stores={Stores$}>
        <EpisodePage />
      </Dehydration>
    </NextNavigation>
  )
}
