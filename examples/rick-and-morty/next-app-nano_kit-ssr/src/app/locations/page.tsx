import { Dehydration } from '@nano_kit/react'
import { NextNavigation } from '@nano_kit/next-router'
import { routes } from '@/stores/router'
import LocationsPage, { Stores$ } from '@/ui/pages/Locations'

export default function Page() {
  return (
    <NextNavigation routes={routes}>
      <Dehydration stores={Stores$}>
        <LocationsPage />
      </Dehydration>
    </NextNavigation>
  )
}
