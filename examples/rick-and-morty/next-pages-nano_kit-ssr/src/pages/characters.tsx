import type { GetServerSideProps } from 'next'
import { dehydrate } from '@nano_kit/store'
import { isFlight } from '@nano_kit/react'
import { virtualNavigationContext } from '@nano_kit/next-router'
import { routes } from '@/stores/router'
import CharactersPage, { Stores$ } from '@/ui/pages/Characters'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const dehydrated = !isFlight(context.req.headers) && await dehydrate(
    Stores$,
    virtualNavigationContext(context.resolvedUrl, routes)
  )

  return {
    props: {
      dehydrated
    }
  }
}

export default function Page() {
  return <CharactersPage />
}
