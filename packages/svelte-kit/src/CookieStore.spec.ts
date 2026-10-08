import type { Cookies } from '@sveltejs/kit'
import {
  describe,
  expect,
  it
} from 'vitest'
import { CookieStore } from './CookieStore.js'

interface CodingOptions {
  decode?(value: string): string
  encode?(value: string): string
}

/* SvelteKit's `cookies` encode values on write and decode them on read, unless the options
   bring their own `encode` and `decode` */
function createCookies() {
  const headers = new Map<string, string>()
  const cookies = {
    get(name: string, options?: CodingOptions) {
      const value = headers.get(name)

      return value === undefined
        ? value
        : (options?.decode ?? decodeURIComponent)(value)
    },
    getAll(options?: CodingOptions) {
      return [...headers].map(([name, value]) => ({
        name,
        value: (options?.decode ?? decodeURIComponent)(value)
      }))
    },
    set(name: string, value: string, options: CodingOptions) {
      headers.set(name, (options.encode ?? encodeURIComponent)(value))
    },
    delete(name: string) {
      headers.delete(name)
    }
  }

  return {
    headers,
    cookies: cookies as unknown as Cookies
  }
}

describe('svelte-kit', () => {
  describe('CookieStore', () => {
    it('should write cookie values as they are', async () => {
      const {
        headers,
        cookies
      } = createCookies()
      const store = new CookieStore(cookies)

      await store.set('value', 'a%41b')

      expect(headers.get('value')).toBe('a%41b')
    })

    it('should read cookie values as they are', async () => {
      const {
        headers,
        cookies
      } = createCookies()
      const store = new CookieStore(cookies)

      headers.set('value', 'a%41b')

      expect(store.peek('value')).toBe('a%41b')
      await expect(store.get('value')).resolves.toMatchObject({
        value: 'a%41b'
      })
      await expect(store.getAll('value')).resolves.toMatchObject([
        {
          value: 'a%41b'
        }
      ])
    })
  })
})
