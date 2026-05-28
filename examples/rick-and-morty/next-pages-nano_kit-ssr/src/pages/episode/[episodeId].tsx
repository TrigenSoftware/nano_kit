import type { GetServerSideProps } from 'next'
import { dehydrate, provide } from '@nano_kit/store'
import { LocationNavigation$, virtualNavigation } from '@nano_kit/router'
import { routes } from '@/stores/router'
import EpisodePage from '@/ui/pages/Episode'
import { Stores$ } from '@/ui/pages/Episode.stores'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const dehydrated = await dehydrate(
    Stores$,
    [
      provide(LocationNavigation$, virtualNavigation(context.resolvedUrl, routes))
    ]
  )

  return {
    props: {
      dehydrated
    }
  }
}

export default function Page() {
  return <EpisodePage />
}
