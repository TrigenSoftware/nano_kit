import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest'
import {
  BooleanCodec,
  debounce,
  effect
} from '@nano_kit/store'
import { waitFor } from '../test/utils.js'
import {
  cookieStored,
  syncedCookieStored
} from './cookie.js'

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
  })
})
