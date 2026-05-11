import type { GetServerSideProps } from 'next'
import { dehydrate, provide } from '@nano_kit/store'
import { isFlight } from '@nano_kit/react'
import { Location$, Navigation$, virtualNavigation } from '@nano_kit/next-router'
import { routes } from '@/stores/router'
import CharactersPage from '@/ui/pages/Characters'
import { Stores$ } from '@/ui/pages/Characters.stores'

export const getServerSideProps: GetServerSideProps = async (context) => {
  let dehydrated

  if (!isFlight(context.req.headers)) {
    const [$location, navigation] = virtualNavigation(context.resolvedUrl, routes)

    dehydrated = await dehydrate(
      Stores$,
      [
        provide(Location$, $location),
        provide(Navigation$, navigation)
      ]
    )
  }

  return {
    props: {
      dehydrated
    }
  }
}

export default function Page() {
  return <CharactersPage />
}
