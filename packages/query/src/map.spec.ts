import {
  vi,
  describe,
  it,
  expect
} from 'vitest'
import { effect } from '@nano_kit/store'
import {
  type ShardedSignalsMap,
  hasShardedMapKey,
  $getShardedMapKey,
  setShardedMapKey,
  deleteShardedMapKey
} from './map.js'

describe('query', () => {
  describe('map', () => {
    describe('hasShardedMapKey', () => {
      it('should return false for empty cache', () => {
        const cache: ShardedSignalsMap<string, string, number> = new Map()
        const key = {
          shard: 'test',
          key: 'a'
        }

        expect(hasShardedMapKey(cache, key)).toBe(false)
      })

      it('should return true for shard-only key', () => {
        const cache: ShardedSignalsMap<string, string, number> = new Map()

        setShardedMapKey(cache, {
          shard: 'test',
          key: 'a'
        }, 42)

        expect(hasShardedMapKey(cache, {
          shard: 'test'
        })).toBe(true)
      })

      it('should return true for existing key', () => {
        const cache: ShardedSignalsMap<string, string, number> = new Map()
        const key = {
          shard: 'test',
          key: 'a'
        }

        setShardedMapKey(cache, key, 42)

        expect(hasShardedMapKey(cache, key)).toBe(true)
      })

      it('should return false for non-existing key', () => {
        const cache: ShardedSignalsMap<string, string, number> = new Map()

        setShardedMapKey(cache, {
          shard: 'test',
          key: 'a'
        }, 42)

        expect(hasShardedMapKey(cache, {
          shard: 'test',
          key: 'b'
        })).toBe(false)
      })
    })

    describe('getShardedMapKey', () => {
      it('should return undefined for empty cache', () => {
        const cache: ShardedSignalsMap<string, string, number> = new Map()
        const key = {
          shard: 'test',
          key: 'a'
        }

        expect($getShardedMapKey(cache, key)).toBeUndefined()
      })

      it('should return undefined for shard-only key', () => {
        const cache: ShardedSignalsMap<string, string, number> = new Map()

        setShardedMapKey(cache, {
          shard: 'test',
          key: 'a'
        }, 42)

        expect($getShardedMapKey(cache, {
          shard: 'test',
          key: undefined
        })).toBeUndefined()
      })

      it('should return value for existing key', () => {
        const cache: ShardedSignalsMap<string, string, number> = new Map()
        const key = {
          shard: 'test',
          key: 'a'
        }

        setShardedMapKey(cache, key, 42)

        expect($getShardedMapKey(cache, key)).toBe(42)
      })

      it('should return undefined for non-existing key', () => {
        const cache: ShardedSignalsMap<string, string, number> = new Map()

        setShardedMapKey(cache, {
          shard: 'test',
          key: 'a'
        }, 42)

        expect($getShardedMapKey(cache, {
          shard: 'test',
          key: 'b'
        })).toBeUndefined()
      })

      it('should notify listeners on key insert', () => {
        const cache: ShardedSignalsMap<string, string, number> = new Map()
        const key = {
          shard: 'test',
          key: 'a'
        }
        const listener = vi.fn()
        const off = effect(() => {
          listener($getShardedMapKey(cache, key))
        })

        expect(listener).toHaveBeenCalledTimes(1)
        expect(listener).toHaveBeenCalledWith(undefined)

        setShardedMapKey(cache, key, 42)

        expect(listener).toHaveBeenCalledTimes(2)
        expect(listener).toHaveBeenCalledWith(42)

        off()
      })

      it('should notify listeners on value change', () => {
        const cache: ShardedSignalsMap<string, string, number> = new Map()
        const key = {
          shard: 'test',
          key: 'a'
        }

        setShardedMapKey(cache, key, 42)

        const listener = vi.fn()
        const off = effect(() => {
          listener($getShardedMapKey(cache, key))
        })

        expect(listener).toHaveBeenCalledTimes(1)
        expect(listener).toHaveBeenCalledWith(42)

        setShardedMapKey(cache, key, 100)

        expect(listener).toHaveBeenCalledTimes(2)
        expect(listener).toHaveBeenCalledWith(100)

        off()
      })

      it('should notify listeners on clear', () => {
        const cache: ShardedSignalsMap<string, string, number> = new Map()
        const key = {
          shard: 'test',
          key: 'a'
        }

        setShardedMapKey(cache, key, 42)

        const listener = vi.fn()
        const off = effect(() => {
          listener($getShardedMapKey(cache, key))
        })

        expect(listener).toHaveBeenCalledTimes(1)
        expect(listener).toHaveBeenCalledWith(42)

        deleteShardedMapKey(cache, {
          shard: 'test',
          key: undefined
        })

        expect(listener).toHaveBeenCalledTimes(2)
        expect(listener).toHaveBeenCalledWith(undefined)

        off()
      })
    })

    describe('setShardedMapKey', () => {
      it('should set value for new key', () => {
        const cache: ShardedSignalsMap<string, string, number> = new Map()
        const key = {
          shard: 'test',
          key: 'a'
        }

        setShardedMapKey(cache, key, 42)

        expect($getShardedMapKey(cache, key)).toBe(42)
      })

      it('should update value for existing key', () => {
        const cache: ShardedSignalsMap<string, string, number> = new Map()
        const key = {
          shard: 'test',
          key: 'a'
        }

        setShardedMapKey(cache, key, 42)

        expect($getShardedMapKey(cache, key)).toBe(42)

        setShardedMapKey(cache, key, 100)

        expect($getShardedMapKey(cache, key)).toBe(100)
      })

      it('should set value with updater function', () => {
        const cache: ShardedSignalsMap<string, string, number> = new Map()
        const key = {
          shard: 'test',
          key: 'a'
        }

        setShardedMapKey(cache, key, 42)

        expect($getShardedMapKey(cache, key)).toBe(42)

        setShardedMapKey(cache, key, prev => (prev ?? 0) + 10)

        expect($getShardedMapKey(cache, key)).toBe(52)
      })

      it('should update all entries in shard when key is undefined', () => {
        const cache: ShardedSignalsMap<string, string, number> = new Map()

        setShardedMapKey(cache, {
          shard: 'test',
          key: 'a'
        }, 1)
        setShardedMapKey(cache, {
          shard: 'test',
          key: 'b'
        }, 2)
        setShardedMapKey(cache, {
          shard: 'test',
          key: 'c'
        }, 3)

        expect($getShardedMapKey(cache, {
          shard: 'test',
          key: 'a'
        })).toBe(1)
        expect($getShardedMapKey(cache, {
          shard: 'test',
          key: 'b'
        })).toBe(2)
        expect($getShardedMapKey(cache, {
          shard: 'test',
          key: 'c'
        })).toBe(3)

        setShardedMapKey(cache, {
          shard: 'test',
          key: undefined
        }, 100)

        expect($getShardedMapKey(cache, {
          shard: 'test',
          key: 'a'
        })).toBe(100)
        expect($getShardedMapKey(cache, {
          shard: 'test',
          key: 'b'
        })).toBe(100)
        expect($getShardedMapKey(cache, {
          shard: 'test',
          key: 'c'
        })).toBe(100)
      })

      it('should do nothing when shard-only key and shard does not exist', () => {
        const cache: ShardedSignalsMap<string, string, number> = new Map()

        setShardedMapKey(cache, {
          shard: 'test',
          key: undefined
        }, 100)

        expect(cache.has('test')).toBe(false)
      })

      it('should notify listeners on value change', () => {
        const cache: ShardedSignalsMap<string, string, number> = new Map()
        const key = {
          shard: 'test',
          key: 'a'
        }
        const listener = vi.fn()
        const off = effect(() => {
          listener($getShardedMapKey(cache, key))
        })

        expect(listener).toHaveBeenCalledTimes(1)
        expect(listener).toHaveBeenCalledWith(undefined)

        setShardedMapKey(cache, key, 42)

        expect(listener).toHaveBeenCalledTimes(2)
        expect(listener).toHaveBeenCalledWith(42)

        off()
      })
    })

    describe('deleteShardedMapKey', () => {
      it('should delete existing key', () => {
        const cache: ShardedSignalsMap<string, string, number> = new Map()
        const key = {
          shard: 'test',
          key: 'a'
        }

        setShardedMapKey(cache, key, 42)

        expect($getShardedMapKey(cache, key)).toBe(42)

        deleteShardedMapKey(cache, key)

        expect(hasShardedMapKey(cache, key)).toBe(false)
      })

      it('should clear all entries when key is undefined', () => {
        const cache: ShardedSignalsMap<string, string, number> = new Map()

        setShardedMapKey(cache, {
          shard: 'test',
          key: 'a'
        }, 1)
        setShardedMapKey(cache, {
          shard: 'test',
          key: 'b'
        }, 2)

        expect($getShardedMapKey(cache, {
          shard: 'test',
          key: 'a'
        })).toBe(1)
        expect($getShardedMapKey(cache, {
          shard: 'test',
          key: 'b'
        })).toBe(2)

        deleteShardedMapKey(cache, {
          shard: 'test',
          key: undefined
        })

        expect($getShardedMapKey(cache, {
          shard: 'test',
          key: 'a'
        })).toBeUndefined()
        expect($getShardedMapKey(cache, {
          shard: 'test',
          key: 'b'
        })).toBeUndefined()
      })

      it('should notify listeners on delete', () => {
        const cache: ShardedSignalsMap<string, string, number> = new Map()
        const key = {
          shard: 'test',
          key: 'a'
        }

        setShardedMapKey(cache, key, 42)

        const listener = vi.fn()
        const off = effect(() => {
          listener($getShardedMapKey(cache, key))
        })

        expect(listener).toHaveBeenCalledTimes(1)
        expect(listener).toHaveBeenCalledWith(42)

        deleteShardedMapKey(cache, key)

        expect(listener).toHaveBeenCalledTimes(2)
        expect(listener).toHaveBeenCalledWith(undefined)

        off()
      })
    })
  })
})
