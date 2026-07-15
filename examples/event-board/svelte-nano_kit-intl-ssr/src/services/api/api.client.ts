import { Injectable$ } from '@nano_kit/store'
import type { ApiService$ } from './api'

/**
 * Browser API transport. Requests stay relative to the current origin, so
 * the browser attaches cookies and `Accept-Language` on its own.
 */
export class ClientApiService$ extends Injectable$ implements ApiService$ {
  fetch(url: string, options?: RequestInit) {
    return globalThis.fetch(`/api/${url}`, {
      ...options,
      headers: {
        ...typeof options?.body === 'string'
          ? {
            'Content-Type': 'application/json'
          }
          : undefined,
        ...options?.headers as Record<string, string>
      }
    })
  }
}
