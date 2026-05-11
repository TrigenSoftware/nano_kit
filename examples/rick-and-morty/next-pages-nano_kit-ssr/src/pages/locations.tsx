import type { GetServerSideProps } from 'next'
import { dehydrate, provide } from '@nano_kit/store'
import { Location$, Navigation$, virtualNavigation } from '@nano_kit/router'
import { routes } from '@/stores/router'
import LocationsPage from '@/ui/pages/Locations'
import { Stores$ } from '@/ui/pages/Locations.stores'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const [$location, navigation] = virtualNavigation(context.resolvedUrl, routes)
  const dehydrated = await dehydrate(
    Stores$,
    [
      provide(Location$, $location),
      provide(Navigation$, navigation)
    ]
  )

  return {
    props: {
      dehydrated
    }
  }
}

export default function Page() {
  return <LocationsPage />
}
