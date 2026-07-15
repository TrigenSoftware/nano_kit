import {
  CookieStore$,
  serializeCookies
} from '@nano_kit/platform-web'
import {
  Injectable$,
  inject
} from '@nano_kit/store'
import { IntlService$ } from '../intl'
import type { ApiService$ } from './api'

/**
 * Absolute API origin used by the server renderer.
 * Browser requests stay relative to the current origin.
 */
const API_ORIGIN = import.meta.env.VITE_EVENT_BOARD_API_ORIGIN
  || (import.meta.env.DEV ? 'http://localhost:5173' : 'http://localhost:3001')

/**
 * SSR API transport. Server-to-server requests carry no browser context, so
 * the incoming request cookies and locale are forwarded explicitly.
 */
export class ServerApiService$ extends Injectable$ implements ApiService$ {
  cookieStore = inject(CookieStore$)
  intlService = inject(IntlService$)

  private async getHeaders() {
    const headers: Record<string, string> = {}
    const [
      cookie,
      locale
    ] = await Promise.all([
      serializeCookies(this.cookieStore, ['session']),
      this.intlService.getServerLocale()
    ])

    if (cookie) {
      headers['Cookie'] = cookie
    }

    if (locale) {
      headers['Accept-Language'] = locale
    }

    return headers
  }

  async fetch(url: string, options?: RequestInit) {
    return globalThis.fetch(`${API_ORIGIN}/api/${url}`, {
      ...options,
      headers: {
        ...typeof options?.body === 'string'
          ? {
            'Content-Type': 'application/json'
          }
          : undefined,
        ...await this.getHeaders(),
        ...options?.headers as Record<string, string>
      }
    })
  }
}
