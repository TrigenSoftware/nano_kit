import type { GetServerSideProps } from 'next'
import {
  dehydrate,
  provide
} from '@nano_kit/store'
import { isFlight } from '@nano_kit/react'
import {
  LocationNavigation$,
  virtualNavigation
} from '@nano_kit/next-router'
import { routes } from '@/stores/router'
import CharactersPage from '@/ui/pages/Characters'
import { Stores$ } from '@/ui/pages/Characters.stores'

export const getServerSideProps: GetServerSideProps = async (context) => {
  let dehydrated

  if (!isFlight(context.req.headers)) {
    dehydrated = await dehydrate(
      Stores$,
      [
        provide(LocationNavigation$, virtualNavigation(context.resolvedUrl, routes))
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
