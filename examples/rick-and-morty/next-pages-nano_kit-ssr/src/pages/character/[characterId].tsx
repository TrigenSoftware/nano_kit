import type { GetServerSideProps } from 'next'
import { dehydrate } from '@nano_kit/store'
import { virtualNavigationContext } from '@nano_kit/router'
import { routes } from '@/stores/router'
import CharacterPage from '@/ui/pages/Character'
import { Stores$ } from '@/ui/pages/Character.stores'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const dehydrated = await dehydrate(
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
  return <CharacterPage />
}
