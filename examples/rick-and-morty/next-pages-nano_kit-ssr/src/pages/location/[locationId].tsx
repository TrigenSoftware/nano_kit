import type { GetServerSideProps } from 'next'
import { dehydrate } from '@nano_kit/store'
import { virtualNavigationContext } from '@nano_kit/router'
import { routes } from '@/stores/router'
import LocationPage, { Stores$ } from '@/ui/pages/Location'

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
  return <LocationPage />
}
