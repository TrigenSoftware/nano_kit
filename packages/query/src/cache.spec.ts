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
  dataCacheFacade
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
          key: '[]'
        })
      })

      it('should build key with shard and stringified params', () => {
        const UserKey = queryKey<[id: number], { name: string }>('users')

        expect(UserKey(42)).toEqual({
          shard: 'users',
          key: '[42]'
        })
      })

      it('should build key with multiple params', () => {
        const UserKey = queryKey<[id: number, name: string], { data: unknown }>('users')

        expect(UserKey(42, 'Dan')).toEqual({
          shard: 'users',
          key: '[42,"Dan"]'
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
          key: '[42]'
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
  })
})
