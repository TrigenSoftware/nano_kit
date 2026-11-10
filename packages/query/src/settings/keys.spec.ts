import {
  vi,
  describe,
  it,
  expect
} from 'vitest'
import {
  effect,
  signal,
  waitTasks
} from '@nano_kit/store'
import { queryKey } from '../cache.js'
import { client } from '../client.js'
import {
  type Post,
  getPost
} from '../client.mock.js'
import { keys } from './keys.js'

const PostKey = queryKey<[id: number], Post | null>('post')

describe('query', () => {
  describe('settings', () => {
    describe('keys', () => {
      it('should call the callback with every cached key of the builder and its parameters', async () => {
        const UserKey = queryKey<[id: number], string>('user')
        const {
          query,
          $data,
          eachKey
        } = client(keys())
        const $id = signal(1)
        const callback = vi.fn()
        const [$post] = query(PostKey, [$id], getPost)
        const off = effect(() => {
          $post()
        })

        await waitTasks($post)

        $id(2)

        await waitTasks($post)

        $data(UserKey(1), 'user')
        eachKey(PostKey, callback)

        expect(callback.mock.calls).toEqual([[PostKey(1)], [PostKey(2)]])

        off()
      })

      it('should revalidate only the keys the callback picks by parameters', async () => {
        const {
          query,
          revalidate,
          eachKey
        } = client(keys())
        const fetcher = vi.fn(getPost)
        const [$first] = query(PostKey, [1], fetcher)
        const [$second] = query(PostKey, [2], fetcher)
        const off = effect(() => {
          $first()
          $second()
        })

        await waitTasks($first)
        await waitTasks($second)

        fetcher.mockClear()
        eachKey(PostKey, (key) => {
          if (key.params[0] === 2) {
            revalidate(key)
          }
        })

        await waitTasks($second)

        expect(fetcher).toHaveBeenCalledTimes(1)
        expect(fetcher.mock.calls[0][0]).toBe(2)

        off()
      })

      it('should not call the callback without cached keys of the builder', () => {
        const { eachKey } = client(keys())
        const callback = vi.fn()

        eachKey(PostKey, callback)

        expect(callback).not.toHaveBeenCalled()
      })

      it('should batch the changes made by the callback', () => {
        const TitleKey = queryKey<[id: number], string>('title')
        const {
          $data,
          eachKey
        } = client(keys())
        const titlesSpy = vi.fn()

        $data(TitleKey(1), 'first')
        $data(TitleKey(2), 'second')

        const off = effect(() => {
          titlesSpy([$data(TitleKey(1)), $data(TitleKey(2))])
        })

        eachKey(TitleKey, (key) => {
          $data(key, 'updated')
        })

        expect(titlesSpy).toHaveBeenCalledTimes(2)
        expect(titlesSpy).toHaveBeenLastCalledWith(['updated', 'updated'])

        off()
      })
    })
  })
})
