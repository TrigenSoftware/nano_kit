import {
  action,
  inject
} from '@nano_kit/store'
import { CookieStore$ } from '@nano_kit/cookie-store'
import { cookieStored } from '@nano_kit/platform-web'

const SESSION_MAX_AGE = 60 * 60 * 24 * 30

export function Session$() {
  const cookieStore = inject(CookieStore$)
  const $username = cookieStored<string | null>(cookieStore, {
    name: 'session',
    path: '/',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE
  }, null)
  const login = action((username: string) => {
    const value = username.trim()

    if (value) {
      $username(value)
    }
  })
  const logout = action(() => {
    $username(null)
  })

  return {
    $username,
    login,
    logout
  }
}
