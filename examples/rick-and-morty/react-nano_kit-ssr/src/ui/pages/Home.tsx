import { inject } from '@nano_kit/store'
import {
  Navigation$,
  Paths$
} from '@nano_kit/router'

export function Stores$() {
  const navigation = inject(Navigation$)
  const paths = inject(Paths$)

  navigation.replace(paths.characters, true)

  return []
}

export default function Home() {
  return <></>
}
