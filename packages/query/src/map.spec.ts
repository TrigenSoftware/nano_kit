import {
  vi,
  describe,
  it,
  expect
} from 'vitest'
import { effect } from '@nano_kit/store'
import { ShardedSignalsMap } from './map.js'

describe('query', () => {
  describe('map', () => {
    describe('ShardedSignalsMap', () => {
      describe('has', () => {
        it('should return false for empty cache', () => {
          const cache = new ShardedSignalsMap<string, string, number>()
          const key = {
            shard: 'test',
            key: 'a'
          }

          expect(cache.has(key)).toBe(false)
        })

        it('should return true for shard-only key', () => {
          const cache = new ShardedSignalsMap<string, string, number>()

          cache.set({
            shard: 'test',
            key: 'a'
          }, 42)

          expect(cache.has({
            shard: 'test'
          })).toBe(true)
        })

        it('should return true for existing key', () => {
          const cache = new ShardedSignalsMap<string, string, number>()
          const key = {
            shard: 'test',
            key: 'a'
          }

          cache.set(key, 42)

          expect(cache.has(key)).toBe(true)
        })

        it('should return false for non-existing key', () => {
          const cache = new ShardedSignalsMap<string, string, number>()

          cache.set({
            shard: 'test',
            key: 'a'
          }, 42)

          expect(cache.has({
            shard: 'test',
            key: 'b'
          })).toBe(false)
        })
      })

      describe('$get', () => {
        it('should return undefined for empty cache', () => {
          const cache = new ShardedSignalsMap<string, string, number>()
          const key = {
            shard: 'test',
            key: 'a'
          }

          expect(cache.$get(key)).toBeUndefined()
        })

        it('should return undefined for shard-only key', () => {
          const cache = new ShardedSignalsMap<string, string, number>()

          cache.set({
            shard: 'test',
            key: 'a'
          }, 42)

          expect(cache.$get({
            shard: 'test',
            // @ts-expect-error a key of a shard alone is not a key to read
            key: undefined
          })).toBeUndefined()
        })

        it('should return value for existing key', () => {
          const cache = new ShardedSignalsMap<string, string, number>()
          const key = {
            shard: 'test',
            key: 'a'
          }

          cache.set(key, 42)

          expect(cache.$get(key)).toBe(42)
        })

        it('should return undefined for non-existing key', () => {
          const cache = new ShardedSignalsMap<string, string, number>()

          cache.set({
            shard: 'test',
            key: 'a'
          }, 42)

          expect(cache.$get({
            shard: 'test',
            key: 'b'
          })).toBeUndefined()
        })

        it('should notify listeners on key insert', () => {
          const cache = new ShardedSignalsMap<string, string, number>()
          const key = {
            shard: 'test',
            key: 'a'
          }
          const listener = vi.fn()
          const off = effect(() => {
            listener(cache.$get(key))
          })

          expect(listener).toHaveBeenCalledTimes(1)
          expect(listener).toHaveBeenCalledWith(undefined)

          cache.set(key, 42)

          expect(listener).toHaveBeenCalledTimes(2)
          expect(listener).toHaveBeenCalledWith(42)

          off()
        })

        it('should notify listeners on value change', () => {
          const cache = new ShardedSignalsMap<string, string, number>()
          const key = {
            shard: 'test',
            key: 'a'
          }

          cache.set(key, 42)

          const listener = vi.fn()
          const off = effect(() => {
            listener(cache.$get(key))
          })

          expect(listener).toHaveBeenCalledTimes(1)
          expect(listener).toHaveBeenCalledWith(42)

          cache.set(key, 100)

          expect(listener).toHaveBeenCalledTimes(2)
          expect(listener).toHaveBeenCalledWith(100)

          off()
        })

        it('should notify listeners on clear', () => {
          const cache = new ShardedSignalsMap<string, string, number>()
          const key = {
            shard: 'test',
            key: 'a'
          }

          cache.set(key, 42)

          const listener = vi.fn()
          const off = effect(() => {
            listener(cache.$get(key))
          })

          expect(listener).toHaveBeenCalledTimes(1)
          expect(listener).toHaveBeenCalledWith(42)

          cache.delete({
            shard: 'test',
            key: undefined
          })

          expect(listener).toHaveBeenCalledTimes(2)
          expect(listener).toHaveBeenCalledWith(undefined)

          off()
        })
      })

      describe('set', () => {
        it('should set value for new key', () => {
          const cache = new ShardedSignalsMap<string, string, number>()
          const key = {
            shard: 'test',
            key: 'a'
          }

          cache.set(key, 42)

          expect(cache.$get(key)).toBe(42)
        })

        it('should update value for existing key', () => {
          const cache = new ShardedSignalsMap<string, string, number>()
          const key = {
            shard: 'test',
            key: 'a'
          }

          cache.set(key, 42)

          expect(cache.$get(key)).toBe(42)

          cache.set(key, 100)

          expect(cache.$get(key)).toBe(100)
        })

        it('should set value with updater function', () => {
          const cache = new ShardedSignalsMap<string, string, number>()
          const key = {
            shard: 'test',
            key: 'a'
          }

          cache.set(key, 42)

          expect(cache.$get(key)).toBe(42)

          cache.set(key, prev => (prev ?? 0) + 10)

          expect(cache.$get(key)).toBe(52)
        })

        it('should update all entries in shard when key is undefined', () => {
          const cache = new ShardedSignalsMap<string, string, number>()

          cache.set({
            shard: 'test',
            key: 'a'
          }, 1)
          cache.set({
            shard: 'test',
            key: 'b'
          }, 2)
          cache.set({
            shard: 'test',
            key: 'c'
          }, 3)

          expect(cache.$get({
            shard: 'test',
            key: 'a'
          })).toBe(1)
          expect(cache.$get({
            shard: 'test',
            key: 'b'
          })).toBe(2)
          expect(cache.$get({
            shard: 'test',
            key: 'c'
          })).toBe(3)

          cache.set({
            shard: 'test',
            key: undefined
          }, 100)

          expect(cache.$get({
            shard: 'test',
            key: 'a'
          })).toBe(100)
          expect(cache.$get({
            shard: 'test',
            key: 'b'
          })).toBe(100)
          expect(cache.$get({
            shard: 'test',
            key: 'c'
          })).toBe(100)
        })

        it('should do nothing when shard-only key and shard does not exist', () => {
          const cache = new ShardedSignalsMap<string, string, number>()

          cache.set({
            shard: 'test',
            key: undefined
          }, 100)

          expect(cache.has({
            shard: 'test'
          })).toBe(false)
        })

        it('should notify listeners on value change', () => {
          const cache = new ShardedSignalsMap<string, string, number>()
          const key = {
            shard: 'test',
            key: 'a'
          }
          const listener = vi.fn()
          const off = effect(() => {
            listener(cache.$get(key))
          })

          expect(listener).toHaveBeenCalledTimes(1)
          expect(listener).toHaveBeenCalledWith(undefined)

          cache.set(key, 42)

          expect(listener).toHaveBeenCalledTimes(2)
          expect(listener).toHaveBeenCalledWith(42)

          off()
        })
      })

      describe('delete', () => {
        it('should delete existing key', () => {
          const cache = new ShardedSignalsMap<string, string, number>()
          const key = {
            shard: 'test',
            key: 'a'
          }

          cache.set(key, 42)

          expect(cache.$get(key)).toBe(42)

          cache.delete(key)

          expect(cache.has(key)).toBe(false)
        })

        it('should clear all entries when key is undefined', () => {
          const cache = new ShardedSignalsMap<string, string, number>()

          cache.set({
            shard: 'test',
            key: 'a'
          }, 1)
          cache.set({
            shard: 'test',
            key: 'b'
          }, 2)

          expect(cache.$get({
            shard: 'test',
            key: 'a'
          })).toBe(1)
          expect(cache.$get({
            shard: 'test',
            key: 'b'
          })).toBe(2)

          cache.delete({
            shard: 'test',
            key: undefined
          })

          expect(cache.$get({
            shard: 'test',
            key: 'a'
          })).toBeUndefined()
          expect(cache.$get({
            shard: 'test',
            key: 'b'
          })).toBeUndefined()
        })

        it('should notify listeners on delete', () => {
          const cache = new ShardedSignalsMap<string, string, number>()
          const key = {
            shard: 'test',
            key: 'a'
          }

          cache.set(key, 42)

          const listener = vi.fn()
          const off = effect(() => {
            listener(cache.$get(key))
          })

          expect(listener).toHaveBeenCalledTimes(1)
          expect(listener).toHaveBeenCalledWith(42)

          cache.delete(key)

          expect(listener).toHaveBeenCalledTimes(2)
          expect(listener).toHaveBeenCalledWith(undefined)

          off()
        })
      })
    })
  })
})
