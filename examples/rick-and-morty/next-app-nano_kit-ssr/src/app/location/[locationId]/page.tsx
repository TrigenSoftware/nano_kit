import { Dehydration } from '@nano_kit/react'
import { NextNavigation } from '@nano_kit/next-router'
import { routes } from '@/stores/router'
import LocationPage from '@/ui/pages/Location'
import { Stores$ } from '@/ui/pages/Location.stores'

export default function Page() {
  return (
    <NextNavigation routes={routes}>
      <Dehydration stores={Stores$}>
        <LocationPage />
      </Dehydration>
    </NextNavigation>
  )
}
