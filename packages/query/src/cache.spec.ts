import {
  vi,
  describe,
  it,
  expect
} from 'vitest'
import { effect } from '@nano_kit/store'
import { CacheStorage } from './CacheStorage.js'
import {
  queryKey,
  keys,
  dataCacheFacade,
  errorCacheFacade
} from './cache.js'

describe('query', () => {
  describe('cache', () => {
    describe('cacheKey', () => {
      it('should create cache key builder', () => {
        const UserKey = queryKey<[id: number], { name: string }>('users')

        expect(UserKey).toBeTypeOf('function')
      })

      it('should can be used as shard key', () => {
        const UserKey = queryKey<[id: number], { name: string }>('users')

        expect(UserKey.shard).toBe('users')
        expect(UserKey.key).toBeUndefined()
      })

      it('should build key without params', () => {
        const UserKey = queryKey<[id: number], { name: string }>('users')

        expect(UserKey()).toEqual({
          shard: 'users',
          key: '[]',
          params: []
        })
      })

      it('should build key with shard and stringified params', () => {
        const UserKey = queryKey<[id: number], { name: string }>('users')

        expect(UserKey(42)).toEqual({
          shard: 'users',
          key: '[42]',
          params: [42]
        })
      })

      it('should build key with multiple params', () => {
        const UserKey = queryKey<[id: number, name: string], { data: unknown }>('users')

        expect(UserKey(42, 'Dan')).toEqual({
          shard: 'users',
          key: '[42,"Dan"]',
          params: [42, 'Dan']
        })
      })

      it('should apply filter to params', () => {
        const UserKey = queryKey<[id: number, _options?: object], { name: string }>(
          'users',
          ([id]) => [id]
        )

        expect(UserKey(42, {
          force: true
        })).toEqual({
          shard: 'users',
          key: '[42]',
          params: [
            42,
            {
              force: true
            }
          ]
        })
      })
    })

    describe('keys', () => {
      it('should call callback with created key builders', () => {
        const UserKey = queryKey<[id: number], { name: string }>('users-list')
        const PostsKey = queryKey<[id: number], { title: string }>('posts-list')
        const callback = vi.fn()

        keys(callback)

        expect(callback.mock.calls.map(([key]) => key)).toContain(UserKey)
        expect(callback.mock.calls.map(([key]) => key)).toContain(PostsKey)
      })
    })

    describe('dataCacheFacade', () => {
      it('should get and set value from cache', () => {
        const $cache = dataCacheFacade(new CacheStorage())
        const key = queryKey<[string], number>('test')('a')

        $cache(key, 42)

        expect($cache(key)).toBe(42)
      })

      it('should revert value change', () => {
        const $cache = dataCacheFacade(new CacheStorage())
        const key = queryKey<[string], number>('test')('a')

        $cache(key, 42)

        const revert = $cache(key, 100)

        expect($cache(key)).toBe(100)

        revert()

        expect($cache(key)).toBe(42)
      })

      it('should pass entry params to reducer', () => {
        const storage = new CacheStorage()
        const $cache = dataCacheFacade(storage)
        const key = queryKey<[id: number, name: string], string>('test')(42, 'Dan')
        const reducer = vi.fn((value: string | null, params: [number, string]) => `${value}:${params.join(':')}`)

        storage.settled(key, 'user', null)
        $cache(key, reducer)

        expect(reducer).toHaveBeenCalledWith('user', [42, 'Dan'])
        expect($cache(key)).toBe('user:42:Dan')
      })

      it('should notify listeners on value change', () => {
        const $cache = dataCacheFacade(new CacheStorage())
        const key = queryKey<[string], number>('test')('a')
        const listener = vi.fn()
        const off = effect(() => {
          listener($cache(key))
        })

        expect(listener).toHaveBeenCalledTimes(1)
        expect(listener).toHaveBeenCalledWith(null)

        $cache(key, 42)

        expect(listener).toHaveBeenCalledTimes(2)
        expect(listener).toHaveBeenCalledWith(42)

        off()
      })
    })

    describe('errorCacheFacade', () => {
      it('should get and set error from cache', () => {
        const $error = errorCacheFacade(new CacheStorage())
        const key = queryKey<[string], number>('test')('a')

        expect($error(key)).toBe(null)

        $error(key, 'failed')

        expect($error(key)).toBe('failed')
      })

      it('should revert error change', () => {
        const $error = errorCacheFacade(new CacheStorage())
        const key = queryKey<[string], number>('test')('a')

        $error(key, 'first')

        const revert = $error(key, 'second')

        expect($error(key)).toBe('second')

        revert()

        expect($error(key)).toBe('first')
      })
    })
  })
})
