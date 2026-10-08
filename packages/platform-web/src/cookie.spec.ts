import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest'
import {
  BooleanCodec,
  JsonCodec,
  debounce,
  effect
} from '@nano_kit/store'
import { waitFor } from '../test/utils.js'
import { VirtualCookieStore } from './cookieStore/index.js'
import {
  cookieStored,
  syncedCookieStored
} from './cookie.js'

const values = [
  '{"discount":"50%"}',
  'a%41b',
  'a;b',
  '{"name":"Сад"}',
  'a, "b" c'
]
const profile = {
  name: 'Сад',
  discount: '50%',
  note: 'a; b, "c"'
}

async function clearCookies() {
  const cookies = await cookieStore.getAll()

  for (const item of cookies) {
    if (item.name) {
      await cookieStore.delete(item.name)
    }
  }
}

describe('platform-web', () => {
  describe('cookie', () => {
    beforeEach(async () => {
      await clearCookies()
      vi.restoreAllMocks()
    })

    it('should read and write cookie values', async () => {
      await cookieStore.set('language', 'en')

      const $language = cookieStored(cookieStore, 'language')

      expect($language()).toBe('en')

      $language('ru')

      await waitFor(async () => {
        await expect(cookieStore.get('language')).resolves.toMatchObject({
          value: 'ru'
        })
      })
    })

    it('should read and write cookie values created from options', async () => {
      const $language = cookieStored(cookieStore, {
        name: 'language',
        expires: Date.now() + 60000
      })

      expect($language()).toBeUndefined()

      $language('ru')

      await waitFor(async () => {
        await expect(cookieStore.get('language')).resolves.toMatchObject({
          value: 'ru'
        })
      })
    })

    it('should apply cookie expiration options', async () => {
      await cookieStore.set('language', 'en')

      const $language = cookieStored(cookieStore, {
        name: 'language',
        expires: Date.now() - 60000
      })

      expect($language()).toBe('en')

      $language('ru')

      await waitFor(async () => {
        await expect(cookieStore.get('language')).resolves.toBe(null)
      })
    })

    it('should apply max age in seconds', async () => {
      const $language = cookieStored(cookieStore, {
        name: 'language',
        maxAge: 60
      })

      $language('ru')

      await waitFor(async () => {
        const cookie = await cookieStore.get('language') as {
          expires?: number | null
        } | null

        expect(cookie?.expires).toBeGreaterThan(Date.now())
        expect(cookie?.expires).toBeLessThanOrEqual(Date.now() + 60000)
      })
    })

    it('should expire the cookie immediately with zero max age', async () => {
      await cookieStore.set('language', 'en')

      const $language = cookieStored(cookieStore, {
        name: 'language',
        maxAge: 0
      })

      expect($language()).toBe('en')

      $language('ru')

      await waitFor(async () => {
        await expect(cookieStore.get('language')).resolves.toBe(null)
      })
    })

    it('should support codecs', async () => {
      await cookieStore.set('dark', '1')

      const $dark = cookieStored(cookieStore, 'dark', BooleanCodec)

      expect($dark()).toBe(true)

      $dark(false)

      await waitFor(async () => {
        await expect(cookieStore.get('dark')).resolves.toMatchObject({
          value: '0'
        })
      })
    })

    it('should delete cookie values when the next value is null or undefined', async () => {
      await cookieStore.set('language', 'en')

      const $language = cookieStored<string | null | undefined>(cookieStore, 'language', 'ru')

      expect($language()).toBe('en')

      $language(null)

      expect($language()).toBe('ru')

      await waitFor(async () => {
        await expect(cookieStore.get('language')).resolves.toBe(null)
      })

      $language('fr')

      await waitFor(async () => {
        await expect(cookieStore.get('language')).resolves.toMatchObject({
          value: 'fr'
        })
      })

      $language(undefined)

      expect($language()).toBe('ru')

      await waitFor(async () => {
        await expect(cookieStore.get('language')).resolves.toBe(null)
      })
    })

    it('should delete cookie values with matching options', () => {
      const store = {
        delete: vi.fn(),
        peek: () => 'en',
        set: vi.fn()
      } as unknown as CookieStore & {
        peek(name: string): string | null
      }
      const $language = cookieStored<string | null>(store, {
        name: 'language',
        domain: 'example.com',
        partitioned: true,
        path: '/app'
      }, null)

      $language(null)

      expect(store.delete).toHaveBeenCalledWith({
        name: 'language',
        domain: 'example.com',
        partitioned: true,
        path: '/app'
      })
    })

    it('should support rate limited writes', async () => {
      vi.useFakeTimers()

      const $query = cookieStored(cookieStore, 'query', '', debounce(300))

      $query('nano')

      await expect(cookieStore.get('query')).resolves.toBe(null)

      vi.advanceTimersByTime(300)

      await waitFor(async () => {
        await expect(cookieStore.get('query')).resolves.toMatchObject({
          value: 'nano'
        })
      })

      vi.useRealTimers()
    })

    it('should react to cookie store changes with syncedCookie', async () => {
      const $language = syncedCookieStored(cookieStore, 'language', 'en')
      const off = effect(() => {
        $language()
      })

      expect($language()).toBe('en')

      await cookieStore.set('language', 'fr')

      await waitFor(() => {
        expect($language()).toBe('fr')
      })

      off()
    })

    it('should use the default value after cookie deletion', async () => {
      await cookieStore.set('language', 'en')

      const $language = syncedCookieStored(cookieStore, 'language', 'en')
      const off = effect(() => {
        $language()
      })

      expect($language()).toBe('en')

      await cookieStore.delete('language')

      await waitFor(() => {
        expect($language()).toBe('en')
      })

      off()
    })

    it('should round-trip values through the browser cookie store', async () => {
      for (const value of values) {
        cookieStored(cookieStore, 'value')(value)

        await waitFor(() => {
          expect(cookieStored(cookieStore, 'value')()).toBe(value)
        })
      }
    })

    it('should pass values to synced signals on cookie store changes', async () => {
      const $value = syncedCookieStored(cookieStore, 'value')
      const off = effect(() => {
        $value()
      })

      for (const value of values) {
        cookieStored(cookieStore, 'value')(value)

        await waitFor(() => {
          expect($value()).toBe(value)
        })
      }

      off()
    })

    it('should round-trip values through a virtual cookie store', () => {
      const store = new VirtualCookieStore()

      for (const value of values) {
        cookieStored(store, 'value')(value)

        expect(cookieStored(store, 'value')()).toBe(value)
      }
    })

    it('should write valid Set-Cookie headers to a virtual cookie store', () => {
      const store = new VirtualCookieStore()

      for (const value of values) {
        cookieStored(store, 'value')(value)

        for (const header of store.getSetCookieHeaders()) {
          expect(() => new Headers([['Set-Cookie', header]])).not.toThrow()
        }
      }
    })

    it('should read a JSON value written on the server', () => {
      const store = new VirtualCookieStore()

      cookieStored(store, 'profile', JsonCodec)(profile)
      document.cookie = store.getSetCookieHeaders()[0]

      expect(cookieStored(cookieStore, 'profile', JsonCodec)()).toEqual(profile)
    })

    it('should pass a JSON value written on the server to synced signals', async () => {
      const store = new VirtualCookieStore()
      const $profile = syncedCookieStored(cookieStore, 'profile', JsonCodec)
      const off = effect(() => {
        $profile()
      })

      cookieStored(store, 'profile', JsonCodec)(profile)
      document.cookie = store.getSetCookieHeaders()[0]

      await waitFor(() => {
        expect($profile()).toEqual(profile)
      })

      off()
    })

    it('should read a value that is not valid percent-encoding as it is', () => {
      document.cookie = 'value=50%; path=/'

      expect(cookieStored(cookieStore, 'value')()).toBe('50%')
    })

    it('should read an empty cookie value', () => {
      document.cookie = 'value=; path=/'

      expect(cookieStored(cookieStore, 'value')()).toBe('')
    })

    it('should not read a cookie whose name only looks alike', () => {
      document.cookie = 'aXb=1; path=/'

      expect(cookieStored(cookieStore, 'a.b')()).toBeUndefined()
    })
  })
})
