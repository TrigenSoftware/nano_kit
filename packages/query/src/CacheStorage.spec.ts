import {
  vi,
  describe,
  it,
  expect,
  beforeEach
} from 'vitest'
import { effect } from '@nano_kit/store'
import { queryKey } from './cache.js'
import { hasShardedMapKey } from './map.js'
import {
  DEFAULT_DEDUPE_TIME,
  DEFAULT_CACHE_TIME,
  UNSET_REV,
  CacheStorage,
  revLock,
  revLocked
} from './CacheStorage.js'

describe('query', () => {
  describe('CacheStorage', () => {
    let storage: CacheStorage

    beforeEach(() => {
      storage = new CacheStorage()
    })

    describe('revLock/revLocked', () => {
      it('should lock rev by making it negative', () => {
        expect(revLock(5)).toBe(-5)
        expect(revLock(0)).toBe(0)
        expect(revLock(-5)).toBe(-5)
      })

      it('should detect locked rev', () => {
        expect(revLocked(-5)).toBe(true)
        expect(revLocked(0)).toBe(false)
        expect(revLocked(5)).toBe(false)
      })
    })

    describe('defaults', () => {
      it('should have default dedupe time', () => {
        expect(storage.dedupeTime).toBe(DEFAULT_DEDUPE_TIME)
      })

      it('should have default cache time', () => {
        expect(storage.cacheTime).toBe(DEFAULT_CACHE_TIME)
      })

      it('should have empty cache', () => {
        expect(storage.cache.size).toBe(0)
      })
    })

    describe('get', () => {
      it('should create entry for new key', () => {
        const key = queryKey('test')('a')
        const entry = storage.$get(key)

        expect(entry).toEqual({
          rev: expect.any(Number),
          dedupes: 0,
          expires: 0,
          data: null,
          error: null,
          loading: false
        })
      })

      it('should return existing entry', () => {
        const key = queryKey('test')('a')

        expect(storage.$get(key)).toBe(storage.$get(key))
      })

      it('should notify listeners on entry create', () => {
        const key = queryKey('test')('a')
        const listener = vi.fn()
        const off = effect(() => {
          listener(storage.$get(key).data)
        })

        expect(listener).toHaveBeenCalledTimes(1)
        expect(listener).toHaveBeenCalledWith(null)

        storage.settled(key, 'result', null)

        expect(listener).toHaveBeenCalledTimes(2)
        expect(listener).toHaveBeenCalledWith('result')

        off()
      })
    })

    describe('set', () => {
      it('should set entry value', () => {
        const key = queryKey('test')('a')
        const entry = {
          rev: 1,
          dedupes: 2,
          expires: 3,
          data: 'data',
          error: null,
          loading: false
        }

        storage.set(key, entry)

        expect(storage.$get(key)).toBe(entry)
      })

      it('should update entry with updater function', () => {
        const key = queryKey('test')('a')

        storage.$get(key)
        storage.set(key, entry => entry && {
          ...entry,
          data: 'updated'
        })

        const entry = storage.$get(key)

        expect(entry.data).toBe('updated')
      })

      it('should notify listeners on value change', () => {
        const key = queryKey('test')('a')

        storage.settled(key, 'first', null)

        const listener = vi.fn()
        const off = effect(() => {
          listener(storage.$get(key).data)
        })

        expect(listener).toHaveBeenCalledTimes(1)
        expect(listener).toHaveBeenCalledWith('first')

        storage.settled(key, 'second', null)

        expect(listener).toHaveBeenCalledTimes(2)
        expect(listener).toHaveBeenCalledWith('second')

        off()
      })
    })

    describe('invalidate', () => {
      it('should delete entry by key', () => {
        const key = queryKey('test')('a')

        storage.$get(key)

        expect(hasShardedMapKey(storage.cache, key)).toBe(true)

        storage.invalidate(key)

        expect(hasShardedMapKey(storage.cache, key)).toBe(false)
      })

      it('should delete all entries in shard when key is undefined', () => {
        const TestKey = queryKey('test')
        const keyA = TestKey('a')
        const keyB = TestKey('b')

        storage.$get(keyA)
        storage.$get(keyB)

        expect(hasShardedMapKey(storage.cache, keyA)).toBe(true)
        expect(hasShardedMapKey(storage.cache, keyB)).toBe(true)

        storage.invalidate(TestKey)

        expect(hasShardedMapKey(storage.cache, keyA)).toBe(false)
        expect(hasShardedMapKey(storage.cache, keyB)).toBe(false)
      })

      it('should delete all entries when key is omitted', () => {
        const TestKey = queryKey('test')
        const OtherKey = queryKey('other')
        const keyA = TestKey('a')
        const keyB = OtherKey('b')

        storage.$get(keyA)
        storage.$get(keyB)

        expect(hasShardedMapKey(storage.cache, keyA)).toBe(true)
        expect(hasShardedMapKey(storage.cache, keyB)).toBe(true)

        storage.invalidate()

        expect(storage.cache.size).toBe(0)
        expect(hasShardedMapKey(storage.cache, keyA)).toBe(false)
        expect(hasShardedMapKey(storage.cache, keyB)).toBe(false)
      })

      it('should notify listeners on invalidate', () => {
        const key = queryKey('test')('a')

        storage.settled(key, 'data', null)

        const listener = vi.fn()
        const off = effect(() => {
          listener(storage.$get(key).data)
        })

        expect(listener).toHaveBeenCalledTimes(1)
        expect(listener).toHaveBeenCalledWith('data')

        storage.invalidate(key)

        expect(listener).toHaveBeenCalledTimes(2)
        expect(listener).toHaveBeenCalledWith(null)

        off()
      })

      it('should notify listeners on shard invalidate', () => {
        const TestKey = queryKey('test')
        const keyA = TestKey('a')
        const keyB = TestKey('b')

        storage.settled(keyA, 'dataA', null)
        storage.settled(keyB, 'dataB', null)

        const listenerA = vi.fn()
        const listenerB = vi.fn()
        const offA = effect(() => {
          listenerA(storage.$get(keyA).data)
        })
        const offB = effect(() => {
          listenerB(storage.$get(keyB).data)
        })

        expect(listenerA).toHaveBeenCalledTimes(1)
        expect(listenerA).toHaveBeenCalledWith('dataA')
        expect(listenerB).toHaveBeenCalledTimes(1)
        expect(listenerB).toHaveBeenCalledWith('dataB')

        storage.invalidate(TestKey)

        expect(listenerA).toHaveBeenCalledTimes(2)
        expect(listenerA).toHaveBeenCalledWith(null)
        expect(listenerB).toHaveBeenCalledTimes(2)
        expect(listenerB).toHaveBeenCalledWith(null)

        offA()
        offB()
      })

      it('should notify listeners on invalidate without key', () => {
        const TestKey = queryKey('test')
        const OtherKey = queryKey('other')
        const keyA = TestKey('a')
        const keyB = OtherKey('b')

        storage.settled(keyA, 'dataA', null)
        storage.settled(keyB, 'dataB', null)

        const listenerA = vi.fn()
        const listenerB = vi.fn()
        const offA = effect(() => {
          listenerA(storage.$get(keyA).data)
        })
        const offB = effect(() => {
          listenerB(storage.$get(keyB).data)
        })

        expect(listenerA).toHaveBeenCalledTimes(1)
        expect(listenerA).toHaveBeenCalledWith('dataA')
        expect(listenerB).toHaveBeenCalledTimes(1)
        expect(listenerB).toHaveBeenCalledWith('dataB')

        storage.invalidate()

        expect(listenerA).toHaveBeenCalledTimes(2)
        expect(listenerA).toHaveBeenCalledWith(null)
        expect(listenerB).toHaveBeenCalledTimes(2)
        expect(listenerB).toHaveBeenCalledWith(null)

        offA()
        offB()
      })
    })

    describe('revalidate', () => {
      it('should set rev to UNSET_REV and reset dedupes', () => {
        const key = queryKey('test')('a')

        storage.set(key, {
          rev: 100,
          dedupes: 500,
          expires: 1000,
          data: 'data',
          error: null,
          loading: false
        })

        storage.revalidate(key)

        const entry = storage.$get(key)

        expect(entry.rev).toBe(UNSET_REV)
        expect(entry.dedupes).toBe(0)
        expect(entry.data).toBe('data')
      })

      it('should do nothing for non-existing key', () => {
        const key = queryKey('test')('a')

        storage.revalidate(key)

        expect(storage.cache.has('test')).toBe(false)
      })

      it('should notify listeners on revalidate', () => {
        const key = queryKey('test')('a')

        storage.settled(key, 'data', null)

        const listener = vi.fn()
        const off = effect(() => {
          listener(storage.$get(key).data)
        })

        expect(listener).toHaveBeenCalledTimes(1)
        expect(listener).toHaveBeenCalledWith('data')

        storage.revalidate(key)

        expect(listener).toHaveBeenCalledTimes(2)
        expect(listener).toHaveBeenCalledWith('data')

        off()
      })
    })

    describe('mute', () => {
      it('should return true when loading', () => {
        const entry = {
          rev: 1,
          dedupes: 0,
          expires: 0,
          data: null,
          error: null,
          loading: true
        }

        expect(storage.mute(entry)).toBe(true)
      })

      it('should return true when dedupes is in future', () => {
        const entry = {
          rev: 1,
          dedupes: Date.now() + 10000,
          expires: 0,
          data: null,
          error: null,
          loading: false
        }

        expect(storage.mute(entry)).toBe(true)
      })

      it('should return true when rev is locked', () => {
        const entry = {
          rev: revLock(5),
          dedupes: 0,
          expires: 0,
          data: null,
          error: null,
          loading: false
        }

        expect(storage.mute(entry)).toBe(true)
      })

      it('should return false when not loading and dedupes expired', () => {
        const entry = {
          rev: 1,
          dedupes: Date.now() - 1000,
          expires: 0,
          data: null,
          error: null,
          loading: false
        }

        expect(storage.mute(entry)).toBe(false)
      })

      it('should respect loadingDedupe flag', () => {
        const entry = {
          rev: 1,
          dedupes: 0,
          expires: 0,
          data: null,
          error: null,
          loading: true
        }

        expect(storage.mute(entry, false)).toBe(false)
      })

      it('should respect timeDedupe flag', () => {
        const entry = {
          rev: 1,
          dedupes: Date.now() + 10000,
          expires: 0,
          data: null,
          error: null,
          loading: false
        }

        expect(storage.mute(entry, true, false)).toBe(false)
      })
    })

    describe('loading', () => {
      it('should set loading to true and clear error', () => {
        const key = queryKey('test')('a')

        storage.set(key, {
          rev: 1,
          dedupes: 0,
          expires: 0,
          data: null,
          error: 'previous error',
          loading: false
        })

        storage.loading(key)

        const entry = storage.$get(key)

        expect(entry.loading).toBe(true)
        expect(entry.error).toBe(null)
      })

      it('should return rev number', () => {
        const key = queryKey('test')('a')
        const rev = storage.loading(key)

        expect(typeof rev).toBe('number')
        expect(rev).toBeGreaterThan(0)
      })

      it('should keep data when not expired', () => {
        const key = queryKey('test')('a')

        storage.set(key, {
          rev: 1,
          dedupes: 0,
          expires: Date.now() + 10000,
          data: 'cached data',
          error: null,
          loading: false
        })

        storage.loading(key)

        const entry = storage.$get(key)

        expect(entry.loading).toBe(true)
        expect(entry.data).toBe('cached data')
      })

      it('should clear data when expired', () => {
        const key = queryKey('test')('a')

        storage.set(key, {
          rev: 1,
          dedupes: 0,
          expires: Date.now() - 1000,
          data: 'old data',
          error: null,
          loading: false
        })

        storage.loading(key)

        const entry = storage.$get(key)

        expect(entry.loading).toBe(true)
        expect(entry.data).toBe(null)
      })

      it('should notify listeners on loading state change', () => {
        const key = queryKey('test')('a')
        const listener = vi.fn()
        const off = effect(() => {
          listener(storage.$get(key).loading)
        })

        expect(listener).toHaveBeenCalledTimes(1)
        expect(listener).toHaveBeenCalledWith(false)

        storage.loading(key)

        expect(listener).toHaveBeenCalledTimes(2)
        expect(listener).toHaveBeenCalledWith(true)

        storage.settled(key, 'result', null)

        expect(listener).toHaveBeenCalledTimes(3)
        expect(listener).toHaveBeenCalledWith(false)

        off()
      })
    })

    describe('settled', () => {
      it('should set data on success', () => {
        const key = queryKey('test')('a')

        storage.settled(key, 'result', null)

        const entry = storage.$get(key)

        expect(entry.data).toBe('result')
        expect(entry.error).toBe(null)
        expect(entry.loading).toBe(false)
      })

      it('should set error on failure', () => {
        const key = queryKey('test')('a')

        storage.set(key, {
          rev: 1,
          dedupes: 0,
          expires: 0,
          data: 'previous data',
          error: null,
          loading: true
        })

        storage.settled(key, null, 'error message')

        const entry = storage.$get(key)

        expect(entry.data).toBe('previous data')
        expect(entry.error).toBe('error message')
        expect(entry.loading).toBe(false)
      })

      it('should ignore settled if rev does not match', () => {
        const key = queryKey('test')('a')
        const rev = storage.loading(key)

        storage.settled(key, 'first', null, rev)

        expect(storage.$get(key).data).toBe('first')

        storage.settled(key, 'second', null, rev + 1)

        expect(storage.$get(key).data).toBe('first')
      })

      it('should update dedupes and expires timestamps', () => {
        const key = queryKey('test')('a')
        const now = Date.now()

        storage.settled(key, 'result', null)

        const entry = storage.$get(key)

        expect(entry.dedupes).toBeGreaterThanOrEqual(now + DEFAULT_DEDUPE_TIME)
        expect(entry.expires).toBe(Infinity)
      })

      it('should use custom dedupe and cache times', () => {
        storage.dedupeTime = 1000
        storage.cacheTime = 5000

        const key = queryKey('test')('a')

        storage.$get(key)

        const now = Date.now()

        storage.settled(key, 'result', null)

        const entry = storage.$get(key)

        expect(entry.dedupes).toBeGreaterThanOrEqual(now + 1000)
        expect(entry.dedupes).toBeLessThanOrEqual(now + 1100)
        expect(entry.expires).toBeGreaterThanOrEqual(now + 5000)
        expect(entry.expires).toBeLessThanOrEqual(now + 5100)
      })

      it('should notify listeners on state change', () => {
        const key = queryKey('test')('a')
        const listener = vi.fn()
        const off = effect(() => {
          const entry = storage.$get(key)

          listener(entry.error || entry.data)
        })

        expect(listener).toHaveBeenCalledTimes(1)
        expect(listener).toHaveBeenCalledWith(null)

        storage.settled(key, 'result', null)

        expect(listener).toHaveBeenCalledTimes(2)
        expect(listener).toHaveBeenCalledWith('result')

        storage.settled(key, undefined, 'error')

        expect(listener).toHaveBeenCalledTimes(3)
        expect(listener).toHaveBeenCalledWith('error')

        off()
      })
    })
  })
})
