import {
  vi,
  describe,
  it,
  expect
} from 'vitest'
import {
  effect,
  signal
} from '@nano_kit/store'
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

      it('should warn about a cache key parameter that serializes to null', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const CallbackKey = queryKey<[callback: () => void], unknown>('callbacks')

        CallbackKey(() => {})

        expect(warn).toHaveBeenCalledTimes(1)
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('function'))
        warn.mockRestore()
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

      it('should not subscribe the writing effect to signals read by the updater', () => {
        const $cache = dataCacheFacade(new CacheStorage())
        const key = queryKey<[string], number>('test')('a')
        const $unrelated = signal(1)
        const listener = vi.fn()
        let written = false
        const off = effect(() => {
          listener($cache(key))

          if (!written) {
            written = true

            $cache(key, () => $unrelated())
          }
        })
        const runs = listener.mock.calls.length

        $unrelated(2)

        // the updater's read must not be a dependency of the writing effect
        expect(listener).toHaveBeenCalledTimes(runs)

        off()
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

      it('should bring back an entry deleted after the write', () => {
        const storage = new CacheStorage()
        const $cache = dataCacheFacade(storage)
        const key = queryKey<[string], number>('test')('a')

        $cache(key, 42)

        const revert = $cache(key, 100)

        storage.invalidate(key)
        revert()

        expect($cache(key)).toBe(42)
      })

      it('should revert every entry of a shard to its own value', () => {
        const $cache = dataCacheFacade(new CacheStorage())
        const Key = queryKey<[string], number>('test')

        $cache(Key('a'), 1)
        $cache(Key('b'), 2)

        const revert = $cache(Key, 100)

        expect($cache(Key('a'))).toBe(100)
        expect($cache(Key('b'))).toBe(100)

        revert()

        expect($cache(Key('a'))).toBe(1)
        expect($cache(Key('b'))).toBe(2)
      })

      it('should not revert an entry added to a shard after the write', () => {
        const $cache = dataCacheFacade(new CacheStorage())
        const Key = queryKey<[string], number>('test')

        $cache(Key('a'), 1)

        const revert = $cache(Key, 100)

        $cache(Key('b'), 2)
        revert()

        expect($cache(Key('a'))).toBe(1)
        expect($cache(Key('b'))).toBe(2)
      })

      it('should revert a write to an empty shard', () => {
        const $cache = dataCacheFacade(new CacheStorage())
        const Key = queryKey<[string], number>('test')
        const revert = $cache(Key, 100)

        $cache(Key('a'), 1)
        revert()

        expect($cache(Key('a'))).toBe(1)
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

      describe('undo', () => {
        const CountKey = queryKey<[name: string], number>('count')

        it('should pass the current and the previous data', () => {
          const $cache = dataCacheFacade(new CacheStorage())
          const key = CountKey('a')
          const undo = vi.fn((current: number | null) => current)

          $cache(key, 1)

          const revert = $cache(key, 2, undo)

          $cache(key, 3)
          revert()

          expect(undo).toHaveBeenCalledTimes(1)
          expect(undo).toHaveBeenCalledWith(3, 1)
        })

        it('should keep a change made after the write', () => {
          const PostKey = queryKey<[id: number], {
            title: string
            likes: number
          } | null>('post')
          const $cache = dataCacheFacade(new CacheStorage())
          const key = PostKey(1)

          $cache(key, {
            title: 'old',
            likes: 0
          })

          const revert = $cache(
            key,
            post => post && {
              ...post,
              title: 'new'
            },
            (current, prev) => current && {
              ...current,
              ...prev && {
                title: prev.title
              }
            }
          )

          $cache(key, post => post && {
            ...post,
            likes: 1
          })
          revert()

          expect($cache(key)).toEqual({
            title: 'old',
            likes: 1
          })
        })

        it('should undo changes in any order', () => {
          const $cache = dataCacheFacade(new CacheStorage())
          const key = CountKey('a')

          $cache(key, 0)

          const revertFirst = $cache(key, value => (value ?? 0) + 1, value => (value ?? 0) - 1)
          const revertSecond = $cache(key, value => (value ?? 0) + 10, value => (value ?? 0) - 10)

          revertFirst()

          expect($cache(key)).toBe(10)

          revertSecond()

          expect($cache(key)).toBe(0)
        })

        it('should undo to falsy data', () => {
          const $cache = dataCacheFacade(new CacheStorage())
          const key = CountKey('a')

          $cache(key, 0)

          const revert = $cache(key, 1, (_, prev) => prev)

          revert()

          expect($cache(key)).toBe(0)
        })

        it('should pass null as the current data', () => {
          const $cache = dataCacheFacade(new CacheStorage())
          const key = CountKey('a')
          const undo = vi.fn((current: number | null) => current)

          $cache(key, 1)

          const revert = $cache(key, 2, undo)

          $cache(key, null)
          revert()

          expect(undo).toHaveBeenCalledWith(null, 1)
          expect($cache(key)).toBe(null)
        })

        it('should pass null as the previous data', () => {
          const $cache = dataCacheFacade(new CacheStorage())
          const key = CountKey('a')
          const undo = vi.fn((current: number | null) => current)
          const revert = $cache(key, 1, undo)

          revert()

          expect(undo).toHaveBeenCalledWith(1, null)
          expect($cache(key)).toBe(1)
        })

        it('should clear an entry that had no data', () => {
          const $cache = dataCacheFacade(new CacheStorage())
          const key = CountKey('a')
          const revert = $cache(key, 1, (_, prev) => prev)

          revert()

          expect($cache(key)).toBe(null)
        })

        it('should undo every entry of a shard', () => {
          const $cache = dataCacheFacade(new CacheStorage())

          $cache(CountKey('a'), 1)
          $cache(CountKey('b'), 2)

          const revert = $cache(CountKey, value => (value ?? 0) + 10, value => (value ?? 0) - 10)

          revert()

          expect($cache(CountKey('a'))).toBe(1)
          expect($cache(CountKey('b'))).toBe(2)
        })

        it('should pass every entry of a shard its own previous data', () => {
          const $cache = dataCacheFacade(new CacheStorage())

          $cache(CountKey('a'), 1)
          $cache(CountKey('b'), 2)

          const revert = $cache(CountKey, 100, (_, prev) => prev)

          revert()

          expect($cache(CountKey('a'))).toBe(1)
          expect($cache(CountKey('b'))).toBe(2)
        })
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

      it('should revert every entry of a shard to its own error', () => {
        const $error = errorCacheFacade(new CacheStorage())
        const Key = queryKey<[string], number>('test')

        $error(Key('a'), 'first')
        $error(Key('b'), 'second')

        const revert = $error(Key, 'third')

        revert()

        expect($error(Key('a'))).toBe('first')
        expect($error(Key('b'))).toBe('second')
      })
    })
  })
})
