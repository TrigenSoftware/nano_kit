import { Dehydration } from '@nano_kit/react'
import { NextNavigation } from '@nano_kit/next-router'
import { routes } from '@/stores/router'
import LocationPage, { Stores$ } from '@/ui/pages/Location'

export default function Page() {
  return (
    <NextNavigation routes={routes}>
      <Dehydration stores={Stores$}>
        <LocationPage />
      </Dehydration>
    </NextNavigation>
  )
}
