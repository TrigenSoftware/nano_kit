import {
  afterEach,
  beforeEach,
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
  localStored,
  syncedLocalStored
} from './localStorage.js'

describe('platform-web', () => {
  describe('localStorage', () => {
    beforeEach(() => {
      localStorage.clear()
      vi.restoreAllMocks()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should read and write localStored values', () => {
      localStorage.setItem('language', 'en')

      const $language = localStored('language')

      expect($language()).toBe('en')

      $language('ru')

      expect(localStorage.getItem('language')).toBe('ru')
    })

    it('should support codecs', () => {
      localStorage.setItem('dark', '1')

      const $dark = localStored('dark', BooleanCodec)

      expect($dark()).toBe(true)

      $dark(false)

      expect(localStorage.getItem('dark')).toBe('0')
    })

    it('should support rate limited writes', () => {
      vi.useFakeTimers()

      const $query = localStored('query', '', debounce(300))

      $query('nano')

      expect(localStorage.getItem('query')).toBe(null)

      vi.advanceTimersByTime(300)

      expect(localStorage.getItem('query')).toBe('nano')
    })

    it('should react to storage events with syncedLocalStored', async () => {
      const $language = syncedLocalStored('language', 'en')
      const off = effect(() => {
        $language()
      })

      expect($language()).toBe('en')

      await commands.setLocalStorage('language', 'fr')

      expect($language()).toBe('fr')

      off()
    })

    it('should ignore storage events for other keys', async () => {
      const $language = syncedLocalStored('language', 'en')
      const off = effect(() => {
        $language()
      })

      await commands.setLocalStorage('theme', 'dark')

      expect($language()).toBe('en')

      off()
    })
  })
})
