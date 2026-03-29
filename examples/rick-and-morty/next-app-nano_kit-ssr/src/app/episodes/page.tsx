import { Dehydration } from '@nano_kit/react'
import { NextNavigation } from '@nano_kit/next-router'
import { routes } from '@/stores/router'
import EpisodesPage, { Stores$ } from '@/ui/pages/Episodes'

export default function Page() {
  return (
    <NextNavigation routes={routes}>
      <Dehydration stores={Stores$}>
        <EpisodesPage />
      </Dehydration>
    </NextNavigation>
  )
}
