import { inject } from '@nano_kit/store'
import { Navigation$ } from '@nano_kit/router'

export function Stores$() {
  const navigation = inject(Navigation$)

  navigation.replace('characters', true)

  return []
}

export default function Home() {
  return <></>
}
