import {
  vi,
  describe,
  it,
  expect,
  beforeEach
} from 'vitest'
import {
  type TasksPool,
  effect,
  signal,
  tasksRunner,
  waitTasks
} from '@nano_kit/store'
import { queryKey } from '../cache.js'
import { tasks } from '../ClientContext.js'
import {
  client,
  infinites
} from '../client.js'
import type { InfinitePages } from './infinite.js'
import {
  type PostsPage,
  resetMockData,
  getPosts
} from '../client.mock.js'

const PostsKey = queryKey<[], InfinitePages<PostsPage, number | undefined>>('posts')

describe('query', () => {
  describe('queries', () => {
    describe('infinite', () => {
      const tasksPool: TasksPool = new Set()

      beforeEach(() => {
        tasksPool.clear()
        resetMockData()
      })

      it('should fetch initial page on mount', async () => {
        const { infinite } = client(infinites(), tasks(tasksRunner(tasksPool)))
        const dataSpy = vi.fn()
        const [, $data, $error, $loading] = infinite(
          PostsKey,
          [],
          page => page.nextCursor,
          getPosts
        )

        expect($loading()).toBe(false)

        const off = effect(() => {
          dataSpy($data())
        })

        expect(dataSpy).toHaveBeenCalledTimes(1)
        expect(dataSpy).toHaveBeenCalledWith(null)
        expect($loading()).toBe(true)

        await waitTasks(tasksPool)

        expect(dataSpy).toHaveBeenCalledTimes(2)
        expect($data()).toEqual({
          pages: [
            {
              posts: [
                {
                  id: 1,
                  title: 'First Post',
                  content: 'Hello World!'
                },
                {
                  id: 2,
                  title: 'Second Post',
                  content: 'Another post content'
                }
              ],
              nextCursor: 2
            }
          ],
          next: 2,
          more: true
        })
        expect($error()).toBe(null)
        expect($loading()).toBe(false)

        off()
      })

      it('should fetch next page with fetchNext', async () => {
        const { infinite } = client(infinites(), tasks(tasksRunner(tasksPool)))
        const dataSpy = vi.fn()
        const [fetchNext, $data, , $loading] = infinite(
          PostsKey,
          [],
          page => page.nextCursor,
          getPosts
        )
        const off = effect(() => {
          dataSpy($data())
        })

        await waitTasks(tasksPool)

        expect($data()?.pages).toHaveLength(1)
        expect($data()?.more).toBe(true)

        fetchNext()

        expect($loading()).toBe(true)

        await waitTasks(tasksPool)

        expect(dataSpy).toHaveBeenCalledTimes(3)
        expect($data()?.pages).toHaveLength(2)
        expect($data()).toEqual({
          pages: [
            {
              posts: [
                {
                  id: 1,
                  title: 'First Post',
                  content: 'Hello World!'
                },
                {
                  id: 2,
                  title: 'Second Post',
                  content: 'Another post content'
                }
              ],
              nextCursor: 2
            },
            {
              posts: [
                {
                  id: 3,
                  title: 'Third Post',
                  content: 'Yet another post'
                }
              ],
              nextCursor: null
            }
          ],
          next: null,
          more: false
        })
        expect($loading()).toBe(false)

        off()
      })

      it('should not fetch when more is false', async () => {
        const { infinite } = client(infinites(), tasks(tasksRunner(tasksPool)))
        const fetcher = vi.fn(getPosts)
        const [fetchNext, $data] = infinite(
          PostsKey,
          [],
          page => page.nextCursor,
          fetcher
        )
        const off = effect(() => {
          $data()
        })

        await waitTasks(tasksPool)

        expect(fetcher).toHaveBeenCalledTimes(1)

        fetchNext()

        await waitTasks(tasksPool)

        expect(fetcher).toHaveBeenCalledTimes(2)
        expect($data()?.more).toBe(false)

        const result = await fetchNext()

        expect(result).toBeUndefined()
        expect(fetcher).toHaveBeenCalledTimes(2)

        off()
      })

      it('should handle errors', async () => {
        const { infinite } = client(infinites(), tasks(tasksRunner(tasksPool)))
        const dataSpy = vi.fn()
        const errorSpy = vi.fn()
        const failingFetcher = vi.fn().mockRejectedValue(new Error('Network error'))
        const [, $data, $error, $loading] = infinite(
          PostsKey,
          [],
          () => undefined,
          failingFetcher
        )
        const off = effect(() => {
          dataSpy($data())
          errorSpy($error())
        })

        expect(dataSpy).toHaveBeenCalledTimes(1)
        expect(dataSpy).toHaveBeenCalledWith(null)
        expect($loading()).toBe(true)

        await waitTasks(tasksPool)

        expect(dataSpy).toHaveBeenCalledTimes(2)
        expect(dataSpy).toHaveBeenLastCalledWith(null)
        expect(errorSpy).toHaveBeenLastCalledWith('Network error')
        expect($data()).toBe(null)
        expect($error()).toBe('Network error')
        expect($loading()).toBe(false)

        off()
      })

      it('should refetch when params change', async () => {
        const PostsWithCategoryKey = queryKey<[category: string], InfinitePages<PostsPage, number>>('posts-category')
        const { infinite } = client(infinites(), tasks(tasksRunner(tasksPool)))
        const $category = signal('tech')
        const dataSpy = vi.fn()
        const fetcher = vi.fn(getPosts)
        const [, $data, , $loading] = infinite(
          PostsWithCategoryKey,
          [$category],
          page => page.nextCursor,
          (_category, cursor) => fetcher(cursor)
        )
        const off = effect(() => {
          dataSpy($data())
        })

        await waitTasks(tasksPool)

        expect(dataSpy).toHaveBeenCalledTimes(2)
        expect($data()?.pages).toHaveLength(1)

        $category('sports')

        expect($loading()).toBe(true)

        await waitTasks(tasksPool)

        expect(dataSpy).toHaveBeenCalledTimes(4)
        expect(fetcher).toHaveBeenCalledTimes(2)
        expect($data()?.pages).toHaveLength(1)

        off()
      })

      it('should reset pages on params change', async () => {
        const PostsWithCategoryKey = queryKey<[category: string], InfinitePages<PostsPage, number>>('posts-category')
        const { infinite } = client(infinites(), tasks(tasksRunner(tasksPool)))
        const $category = signal('tech')
        const [fetchNext, $data] = infinite(
          PostsWithCategoryKey,
          [$category],
          page => page.nextCursor,
          (_category, cursor) => getPosts(cursor)
        )
        const off = effect(() => {
          $data()
        })

        await waitTasks(tasksPool)

        expect($data()?.pages).toHaveLength(1)

        fetchNext()

        await waitTasks(tasksPool)

        expect($data()?.pages).toHaveLength(2)

        $category('sports')

        await waitTasks(tasksPool)

        expect($data()?.pages).toHaveLength(1)

        off()
      })

      it('should replace pages when revalidating the first page', async () => {
        const {
          infinite,
          revalidate
        } = client(infinites(), tasks(tasksRunner(tasksPool)))
        const [fetchNext, $data] = infinite(
          PostsKey,
          [],
          page => page.nextCursor,
          getPosts
        )
        const off = effect(() => {
          $data()
        })

        await waitTasks(tasksPool)

        expect($data()?.pages).toHaveLength(1)

        fetchNext()

        await waitTasks(tasksPool)

        expect($data()?.pages).toHaveLength(2)

        revalidate(PostsKey())

        await waitTasks(tasksPool)

        expect($data()?.pages).toHaveLength(1)
        expect($data()?.pages[0]?.posts.map(post => post.id)).toEqual([1, 2])

        off()
      })
    })
  })
})
