import {
  Navigation$,
  Paths$
} from '@nano_kit/router'
import { inject } from '@nano_kit/store'
import { Session$ } from '#src/stores/session'

export function Stores$() {
  const navigation = inject(Navigation$)
  const paths = inject(Paths$)
  const { logout } = inject(Session$)

  logout()
  navigation.replace(paths.home)

  return []
}

export default function Logout() {
  return <></>
}
