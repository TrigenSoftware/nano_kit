import { Dehydration } from '@nano_kit/react'
import { NextNavigation } from '@nano_kit/next-router'
import { routes } from '@/stores/router'
import LocationsPage from '@/ui/pages/Locations'
import { Stores$ } from '@/ui/pages/Locations.stores'

export default function Page() {
  return (
    <NextNavigation routes={routes}>
      <Dehydration stores={Stores$}>
        <LocationsPage />
      </Dehydration>
    </NextNavigation>
  )
}
