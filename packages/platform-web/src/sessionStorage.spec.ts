import {
  beforeEach,
  afterEach,
  describe,
  expect,
  it,
  vi
} from 'vitest'
import { commands } from 'vitest/browser'
import {
  BooleanCodec,
  debounce,
  effect
} from '@nano_kit/store'
import {
  sessionStored,
  syncedSessionStored
} from './sessionStorage.js'

describe('platform-web', () => {
  describe('sessionStorage', () => {
    beforeEach(() => {
      sessionStorage.clear()
      vi.restoreAllMocks()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should read and write sessionStored values', () => {
      sessionStorage.setItem('language', 'en')

      const $language = sessionStored('language')

      expect($language()).toBe('en')

      $language('ru')

      expect(sessionStorage.getItem('language')).toBe('ru')
    })

    it('should support codecs', () => {
      sessionStorage.setItem('dark', '1')

      const $dark = sessionStored('dark', BooleanCodec)

      expect($dark()).toBe(true)

      $dark(false)

      expect(sessionStorage.getItem('dark')).toBe('0')
    })

    it('should support rate limited writes', () => {
      vi.useFakeTimers()

      const $query = sessionStored('query', '', debounce(300))

      $query('nano')

      expect(sessionStorage.getItem('query')).toBe(null)

      vi.advanceTimersByTime(300)

      expect(sessionStorage.getItem('query')).toBe('nano')
      vi.useRealTimers()
    })

    it('should react to storage events with syncedSessionStored', async () => {
      const $language = syncedSessionStored('language', 'en')
      const off = effect(() => {
        $language()
      })

      expect($language()).toBe('en')

      await commands.setSessionStorage('language', 'fr')

      expect($language()).toBe('fr')

      off()
    })

    it('should ignore storage events for other keys', async () => {
      const $language = syncedSessionStored('language', 'en')
      const off = effect(() => {
        $language()
      })

      await commands.setSessionStorage('theme', 'dark')

      expect($language()).toBe('en')

      off()
    })
  })
})
