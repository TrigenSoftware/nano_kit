import { ClientApiService$ } from './api.client'
import { ServerApiService$ } from './api.server'

export interface ApiService$ {
  /**
   * Fetch wrapper that adds the API base URL, `Content-Type` and forwarded
   * request headers
   * @param url
   * @param options
   * @returns Fetch response
   */
  fetch(url: string, options?: RequestInit): Promise<Response>
}

export const ApiService$ = import.meta.env.SSR
  ? ServerApiService$
  : ClientApiService$
