import { Navigation$ } from '@nano_kit/router'
import { inject } from '@nano_kit/store'
import { Session$ } from '#src/stores/session'

export function Stores$() {
  const navigation = inject(Navigation$)
  const { logout } = inject(Session$)

  logout()
  navigation.replace('/')

  return []
}

export default function Logout() {
  return <></>
}
