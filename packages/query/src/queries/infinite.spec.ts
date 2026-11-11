import {
  vi,
  describe,
  it,
  expect,
  beforeEach
} from 'vitest'
import {
  effect,
  signal,
  waitTasks
} from '@nano_kit/store'
import { queryKey } from '../cache.js'
import {
  client,
  infinites
} from '../client.js'
import { dedupeTime } from '../ClientContext.js'
import {
  onSuccess,
  onError,
  previous
} from '../RequestContext.js'
import {
  drop,
  mapFirstPage
} from '../utils.js'
import type { InfinitePages } from './infinite.js'
import { required } from './base.js'
import {
  type PostsPage,
  resetMockData,
  getPosts,
  createPost
} from '../client.mock.js'

const PostsKey = queryKey<[], InfinitePages<PostsPage, number | undefined>>('posts')
const AuthorPostsKey = queryKey<[authorId: number], InfinitePages<PostsPage, number>>('authorPosts')

describe('query', () => {
  describe('queries', () => {
    describe('infinite', () => {
      beforeEach(() => {
        resetMockData()
      })

      it('should fetch initial page on mount', async () => {
        const { infinite } = client(infinites())
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

        await waitTasks($data)

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
        const { infinite } = client(infinites())
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

        await waitTasks($data)

        expect($data()?.pages).toHaveLength(1)
        expect($data()?.more).toBe(true)

        fetchNext()

        expect($loading()).toBe(true)

        await waitTasks($data)

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
          next: undefined,
          more: false
        })
        expect($loading()).toBe(false)

        off()
      })

      it('should keep cache writes made while the next page loads', async () => {
        const {
          infinite,
          $data
        } = client(infinites())
        const [fetchNext, $posts] = infinite(
          PostsKey,
          [],
          page => page.nextCursor,
          getPosts
        )
        const off = effect(() => {
          $posts()
        })

        await waitTasks($posts)

        const fetching = fetchNext()

        $data(PostsKey(), posts => mapFirstPage(posts, page => ({
          ...page,
          posts: drop(page.posts, post => post.id === 1)
        })))

        await fetching

        expect($posts()?.pages.map(page => page.posts.map(post => post.id))).toEqual([[2], [3]])

        off()
      })

      it('should not fetch when more is false', async () => {
        const { infinite } = client(infinites())
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

        await waitTasks($data)

        expect(fetcher).toHaveBeenCalledTimes(1)

        fetchNext()

        await waitTasks($data)

        expect(fetcher).toHaveBeenCalledTimes(2)
        expect($data()?.more).toBe(false)

        const result = await fetchNext()

        expect(result).toBeUndefined()
        expect(fetcher).toHaveBeenCalledTimes(2)

        off()
      })

      it('should not fetch while a required parameter has no value', async () => {
        const { infinite } = client(infinites())
        const $authorId = signal<number | undefined>(undefined)
        const fetcher = vi.fn((_authorId: number, cursor: number | undefined) => getPosts(cursor))
        const [fetchNext, $data, , $loading] = infinite(
          AuthorPostsKey,
          [required($authorId)],
          page => page.nextCursor,
          fetcher
        )
        const off = effect(() => {
          $data()
        })

        await waitTasks($data)

        expect(await fetchNext()).toBeUndefined()
        expect($data()).toBe(null)
        expect($loading()).toBe(false)
        expect(fetcher).not.toHaveBeenCalled()

        $authorId(1)

        await waitTasks($data)

        expect(fetcher).toHaveBeenCalledTimes(1)
        expect(fetcher).toHaveBeenCalledWith(1, undefined, expect.anything())
        expect($data()?.pages).toHaveLength(1)

        off()
      })

      it('should end the pages without a cursor when next returns false', async () => {
        const { infinite } = client(infinites())
        const [fetchNext, $data] = infinite(
          PostsKey,
          [],
          page => page.nextCursor !== null && page.nextCursor,
          getPosts
        )
        const off = effect(() => {
          $data()
        })

        await waitTasks($data)

        fetchNext()

        await waitTasks($data)

        // The cursor type leaves false out
        const next: number | undefined = $data()?.next

        expect($data()?.more).toBe(false)
        expect(next).toBeUndefined()

        off()
      })

      it('should end the pages without a cursor when next returns null', async () => {
        const { infinite } = client(infinites())
        const [fetchNext, $data] = infinite(
          PostsKey,
          [],
          page => page.nextCursor,
          getPosts
        )
        const off = effect(() => {
          $data()
        })

        await waitTasks($data)

        fetchNext()

        await waitTasks($data)

        // The cursor type leaves null out
        const next: number | undefined = $data()?.next

        expect($data()?.more).toBe(false)
        expect(next).toBeUndefined()

        off()
      })

      it('should handle errors', async () => {
        const { infinite } = client(infinites())
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

        await waitTasks($data)

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
        const { infinite } = client(infinites())
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

        await waitTasks($data)

        expect(dataSpy).toHaveBeenCalledTimes(2)
        expect($data()?.pages).toHaveLength(1)

        $category('sports')

        expect($loading()).toBe(true)

        await waitTasks($data)

        expect(dataSpy).toHaveBeenCalledTimes(4)
        expect(fetcher).toHaveBeenCalledTimes(2)
        expect($data()?.pages).toHaveLength(1)

        off()
      })

      it('should run requests one after another with previous', async () => {
        const PostsWithCategoryKey = queryKey<[category: string], InfinitePages<PostsPage, number>>('posts-category')
        const { infinite } = client(infinites())
        const $category = signal('tech')
        const calls: string[] = []
        const [, $data, , $loading] = infinite(
          PostsWithCategoryKey,
          [$category],
          page => page.nextCursor,
          async (category, cursor, ctx) => {
            await previous(ctx)

            calls.push(`start ${category}`)

            await new Promise(resolve => setTimeout(resolve, category === 'tech' ? 20 : 0))

            calls.push(`end ${category}`)

            return getPosts(cursor)
          }
        )
        const off = effect(() => {
          $data()
        })

        $category('sports')

        expect($loading()).toBe(true)

        await waitTasks($data)

        expect(calls).toEqual([
          'start tech',
          'end tech',
          'start sports',
          'end sports'
        ])
        expect($data()?.pages).toHaveLength(1)

        off()
      })

      it('should reset pages on params change', async () => {
        const PostsWithCategoryKey = queryKey<[category: string], InfinitePages<PostsPage, number>>('posts-category')
        const { infinite } = client(infinites())
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

        await waitTasks($data)

        expect($data()?.pages).toHaveLength(1)

        fetchNext()

        await waitTasks($data)

        expect($data()?.pages).toHaveLength(2)

        $category('sports')

        await waitTasks($data)

        expect($data()?.pages).toHaveLength(1)

        off()
      })

      it('should refetch every loaded page when revalidated', async () => {
        const {
          infinite,
          revalidate
        } = client(infinites())
        const [fetchNext, $data] = infinite(
          PostsKey,
          [],
          page => page.nextCursor,
          getPosts
        )
        const off = effect(() => {
          $data()
        })

        await waitTasks($data)
        await fetchNext()
        await createPost({
          title: 'Fourth Post',
          content: 'Fourth Content'
        })

        revalidate(PostsKey())

        await waitTasks($data)

        expect($data()?.pages.map(page => page.posts.map(post => post.id))).toEqual([[1, 2], [3, 4]])

        off()
      })

      it('should keep the loaded pages when read again after the dedupe time', async () => {
        const { infinite } = client(
          infinites(),
          dedupeTime(0)
        )
        const [fetchNext, $data] = infinite(
          PostsKey,
          [],
          page => page.nextCursor,
          getPosts
        )
        let off = effect(() => {
          $data()
        })

        await waitTasks($data)
        await fetchNext()

        off()
        off = effect(() => {
          $data()
        })

        await waitTasks($data)

        expect($data()?.pages).toHaveLength(2)

        off()
      })

      it('should keep the loaded pages when refetching one of them fails', async () => {
        const {
          infinite,
          revalidate
        } = client(infinites())
        const fetcher = vi.fn(getPosts)
        const [fetchNext, $data, $error] = infinite(
          PostsKey,
          [],
          page => page.nextCursor,
          fetcher
        )
        const off = effect(() => {
          $data()
        })

        await waitTasks($data)
        await fetchNext()

        fetcher.mockImplementation(cursor => (cursor ? Promise.reject(new Error('Network error')) : getPosts(cursor)))
        revalidate(PostsKey())

        await waitTasks($data)

        expect($data()?.pages.map(page => page.posts.map(post => post.id))).toEqual([[1, 2], [3]])
        expect($error()).toBe('Network error')

        off()
      })

      it('should call the success callbacks once when it refetches several pages', async () => {
        const {
          infinite,
          revalidate
        } = client(infinites())
        const successSpy = vi.fn()
        const [fetchNext, $data] = infinite(
          PostsKey,
          [],
          page => page.nextCursor,
          (cursor, ctx) => {
            onSuccess(ctx, successSpy)

            return getPosts(cursor)
          }
        )
        const off = effect(() => {
          $data()
        })

        await waitTasks($data)
        await fetchNext()

        successSpy.mockClear()
        revalidate(PostsKey())

        await waitTasks($data)

        expect(successSpy).toHaveBeenCalledTimes(1)

        off()
      })

      it('should call the error callbacks once when a refetched page fails', async () => {
        const {
          infinite,
          revalidate
        } = client(infinites())
        const errorSpy = vi.fn()
        let failing = false
        const [fetchNext, $data] = infinite(
          PostsKey,
          [],
          page => page.nextCursor,
          (cursor, ctx) => {
            onError(ctx, errorSpy)

            return failing && cursor
              ? Promise.reject(new Error('Network error'))
              : getPosts(cursor)
          }
        )
        const off = effect(() => {
          $data()
        })

        await waitTasks($data)
        await fetchNext()

        failing = true
        revalidate(PostsKey())

        await waitTasks($data)

        expect(errorSpy).toHaveBeenCalledTimes(1)

        off()
      })
    })
  })
})
