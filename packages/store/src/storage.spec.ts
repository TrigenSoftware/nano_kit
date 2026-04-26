import {
  describe,
  expect,
  it,
  vi
} from 'vitest'
import { effect } from 'kida'
import type { RateLimiter } from './types.js'
import {
  stored,
  syncedStored,
  type Storage,
  type SyncedStorage
} from './storage.js'
import {
  BooleanCodec,
  JsonCodec
} from './codec.js'

function createStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial))
  const storage: Storage<string> = {
    get(key) {
      return map.get(key) ?? null
    },
    set(key, value) {
      map.set(key, value)
    }
  }

  return {
    storage,
    map
  }
}

function createSyncedStorage(initial: Record<string, string> = {}) {
  const {
    storage,
    map
  } = createStorage(initial)
  const listeners = new Map<string, Set<(value: string | null) => void>>()
  const syncedStorage: SyncedStorage<string> = {
    ...storage,
    sub(key, callback) {
      listeners.set(key, (listeners.get(key) || new Set()).add(callback))

      return () => {
        const set = listeners.get(key)

        set?.delete(callback)

        if (set?.size === 0) {
          listeners.delete(key)
        }
      }
    }
  }

  return {
    storage: syncedStorage,
    map,
    emit(key: string, value: string | null) {
      if (value === null) {
        map.delete(key)
      } else {
        map.set(key, value)
      }

      listeners.get(key)?.forEach(listener => listener(value))
    }
  }
}

function createRateLimiterSpy() {
  const spy = vi.fn()
  const rateLimiter: RateLimiter = fn => (...args) => {
    spy()
    fn(...args)
  }

  return {
    rateLimiter,
    spy
  }
}

describe('store', () => {
  describe('storage', () => {
    describe('stored', () => {
      it('should support raw string storage with no extra arguments', () => {
        const { storage } = createStorage({
          language: 'en'
        })
        const $language = stored(storage, 'language')

        expect($language()).toBe('en')
      })

      it('should treat the third argument as a rate limiter when it is a function', () => {
        const { storage, map } = createStorage()
        const { rateLimiter, spy } = createRateLimiterSpy()
        const $language = stored(storage, 'language', rateLimiter)

        $language('ru')

        expect(spy).toHaveBeenCalledTimes(1)
        expect(map.get('language')).toBe('ru')
      })

      it('should use the third argument as a default value', () => {
        const { storage } = createStorage()
        const $language = stored(storage, 'language', 'ru')

        expect($language()).toBe('ru')
      })

      it('should support a default value with a rate limiter', () => {
        const { storage, map } = createStorage()
        const { rateLimiter, spy } = createRateLimiterSpy()
        const $language = stored(storage, 'language', 'ru', rateLimiter)

        expect($language()).toBe('ru')

        $language('en')

        expect(spy).toHaveBeenCalledTimes(1)
        expect(map.get('language')).toBe('en')
      })

      it('should support a default value with a codec', () => {
        const { storage } = createStorage({
          cart: '[1,2,3]'
        })
        const $cart = stored(storage, 'cart', [] as number[], JsonCodec)

        expect($cart()).toEqual([1, 2, 3])
      })

      it('should support a default value with a codec and a rate limiter', () => {
        const { storage, map } = createStorage()
        const { rateLimiter, spy } = createRateLimiterSpy()
        const $cart = stored(storage, 'cart', [] as number[], JsonCodec, rateLimiter)

        expect($cart()).toEqual([])

        $cart([1, 2, 3])

        expect(spy).toHaveBeenCalledTimes(1)
        expect(map.get('cart')).toBe('[1,2,3]')
      })

      it('should support codec-only usage', () => {
        const { storage } = createStorage({
          dark: '0'
        })
        const $dark = stored(storage, 'dark', BooleanCodec)

        expect($dark()).toBe(false)
      })

      it('should support codec-only usage with a rate limiter', () => {
        const { storage, map } = createStorage({
          dark: '1'
        })
        const { rateLimiter, spy } = createRateLimiterSpy()
        const $dark = stored(storage, 'dark', BooleanCodec, rateLimiter)

        expect($dark()).toBe(true)

        $dark(false)

        expect(spy).toHaveBeenCalledTimes(1)
        expect(map.get('dark')).toBe('0')
      })
    })

    describe('syncedStored', () => {
      it('should support raw string storage with no extra arguments', () => {
        const { storage } = createSyncedStorage({
          language: 'en'
        })
        const $language = syncedStored(storage, 'language')

        expect($language()).toBe('en')
      })

      it('should treat the third argument as a rate limiter when it is a function', () => {
        const { storage, map } = createSyncedStorage()
        const { rateLimiter, spy } = createRateLimiterSpy()
        const $language = syncedStored(storage, 'language', rateLimiter)

        $language('ru')

        expect(spy).toHaveBeenCalledTimes(1)
        expect(map.get('language')).toBe('ru')
      })

      it('should use the third argument as a default value', () => {
        const { storage } = createSyncedStorage()
        const $language = syncedStored(storage, 'language', 'ru')

        expect($language()).toBe('ru')
      })

      it('should support a default value with a rate limiter', () => {
        const { storage, map } = createSyncedStorage()
        const { rateLimiter, spy } = createRateLimiterSpy()
        const $language = syncedStored(storage, 'language', 'ru', rateLimiter)

        expect($language()).toBe('ru')

        $language('en')

        expect(spy).toHaveBeenCalledTimes(1)
        expect(map.get('language')).toBe('en')
      })

      it('should support a default value with a codec', () => {
        const { storage } = createSyncedStorage({
          cart: '[1,2,3]'
        })
        const $cart = syncedStored(storage, 'cart', [], JsonCodec)

        expect($cart()).toEqual([1, 2, 3])
      })

      it('should support a default value with a codec and a rate limiter', () => {
        const { storage, map } = createSyncedStorage()
        const { rateLimiter, spy } = createRateLimiterSpy()
        const $cart = syncedStored(storage, 'cart', [] as number[], JsonCodec, rateLimiter)

        expect($cart()).toEqual([])

        $cart([1, 2, 3])

        expect(spy).toHaveBeenCalledTimes(1)
        expect(map.get('cart')).toBe('[1,2,3]')
      })

      it('should support codec-only usage', () => {
        const { storage } = createSyncedStorage({
          dark: '0'
        })
        const $dark = syncedStored(storage, 'dark', BooleanCodec)

        expect($dark()).toBe(false)
      })

      it('should support codec-only usage with a rate limiter', () => {
        const { storage, map } = createSyncedStorage({
          dark: '1'
        })
        const { rateLimiter, spy } = createRateLimiterSpy()
        const $dark = syncedStored(storage, 'dark', BooleanCodec, rateLimiter)

        expect($dark()).toBe(true)

        $dark(false)

        expect(spy).toHaveBeenCalledTimes(1)
        expect(map.get('dark')).toBe('0')
      })

      it('should react to external updates', () => {
        const { storage, emit } = createSyncedStorage({
          language: 'en'
        })
        const $language = syncedStored(storage, 'language', 'ru')
        const off = effect(() => {
          $language()
        })

        expect($language()).toBe('en')

        emit('language', 'fr')

        expect($language()).toBe('fr')

        off()
      })

      it('should restore the default value when an external update removes the key', () => {
        const { storage, emit } = createSyncedStorage({
          language: 'en'
        })
        const $language = syncedStored(storage, 'language', 'ru')
        const off = effect(() => {
          $language()
        })

        expect($language()).toBe('en')

        emit('language', null)

        expect($language()).toBe('ru')

        off()
      })
    })
  })
})
