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
import {
  queryKey,
  keys
} from '../cache.js'
import {
  dedupe,
  disabled,
  mapError,
  onEveryError,
  tasks
} from '../ClientContext.js'
import { client } from '../client.js'
import {
  type Post,
  type PostsPage,
  resetMockData,
  getPost,
  getPosts
} from '../client.mock.js'

const PostKey = queryKey<[id: number], Post | null>('post')

describe('query', () => {
  describe('queries', () => {
    describe('query', () => {
      const tasksPool: TasksPool = new Set()

      beforeEach(() => {
        tasksPool.clear()
        resetMockData()
      })

      it('should fetch data on mount', async () => {
        const { query } = client(tasks(tasksRunner(tasksPool)))
        const $postId = signal(1)
        const dataSpy = vi.fn()
        const [$data, $error, $loading] = query(PostKey, [$postId], getPost)

        expect($loading()).toBe(false)

        const off = effect(() => {
          dataSpy($data())
        })

        expect(dataSpy).toHaveBeenCalledTimes(1)
        expect(dataSpy).toHaveBeenCalledWith(null)
        expect($loading()).toBe(true)

        await waitTasks(tasksPool)

        expect(dataSpy).toHaveBeenCalledTimes(2)
        expect(dataSpy).toHaveBeenCalledWith({
          id: 1,
          title: 'First Post',
          content: 'Hello World!'
        })
        expect($data()).toEqual({
          id: 1,
          title: 'First Post',
          content: 'Hello World!'
        })
        expect($error()).toBe(null)
        expect($loading()).toBe(false)

        off()
      })

      it('should refetch when params change', async () => {
        const { query } = client(tasks(tasksRunner(tasksPool)))
        const $postId = signal(1)
        const dataSpy = vi.fn()
        const [$data, , $loading] = query(PostKey, [$postId], getPost)
        const off = effect(() => {
          dataSpy($data())
        })

        await waitTasks(tasksPool)

        expect(dataSpy).toHaveBeenCalledTimes(2)
        expect($data()?.title).toBe('First Post')

        $postId(2)

        expect($loading()).toBe(true)

        await waitTasks(tasksPool)

        expect(dataSpy).toHaveBeenCalledTimes(4)
        expect($data()?.title).toBe('Second Post')

        off()
      })

      it('should revalidate query', async () => {
        const { query, revalidate } = client(tasks(tasksRunner(tasksPool)))
        const $id = signal(1)
        const fetcher = vi.fn(getPost)
        const [$data] = query(PostKey, [$id], fetcher)
        const off = effect(() => {
          $data()
        })

        await waitTasks(tasksPool)

        expect(fetcher).toHaveBeenCalledTimes(1)

        revalidate(PostKey($id()))

        await waitTasks(tasksPool)

        expect(fetcher).toHaveBeenCalledTimes(2)

        off()
      })

      it('should revalidate queries with registered key builders', async () => {
        const { query, revalidate } = client(tasks(tasksRunner(tasksPool)))
        const UserPostKey = queryKey<[id: number], Post | null>('user-post')
        const EditorPostKey = queryKey<[id: number], Post | null>('editor-post')
        const $userPostId = signal(1)
        const $editorPostId = signal(2)
        const userFetcher = vi.fn(getPost)
        const editorFetcher = vi.fn(getPost)
        const [$userPost] = query(UserPostKey, [$userPostId], userFetcher)
        const [$editorPost] = query(EditorPostKey, [$editorPostId], editorFetcher)
        const offUserPost = effect(() => {
          $userPost()
        })
        const offEditorPost = effect(() => {
          $editorPost()
        })

        await waitTasks(tasksPool)

        expect(userFetcher).toHaveBeenCalledTimes(1)
        expect(editorFetcher).toHaveBeenCalledTimes(1)

        keys(revalidate)

        await waitTasks(tasksPool)

        expect(userFetcher).toHaveBeenCalledTimes(2)
        expect(editorFetcher).toHaveBeenCalledTimes(2)

        offUserPost()
        offEditorPost()
      })

      it('should handle errors', async () => {
        const { query } = client(tasks(tasksRunner(tasksPool)))
        const $postId = signal(1)
        const dataSpy = vi.fn()
        const errorSpy = vi.fn()
        const failingFetcher = vi.fn().mockRejectedValue(new Error('Network error'))
        const [$data, $error, $loading] = query(PostKey, [$postId], failingFetcher)
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

      it('should use custom error mapper', async () => {
        const { query } = client(
          tasks(tasksRunner(tasksPool)),
          mapError(err => `Failed: ${(err as Error).message}`)
        )
        const $postId = signal(1)
        const errorSpy = vi.fn()
        const failingFetcher = vi.fn().mockRejectedValue(new Error('Connection refused'))
        const [$data, $error] = query(PostKey, [$postId], failingFetcher)
        const off = effect(() => {
          $data()
          errorSpy($error())
        })

        expect(errorSpy).toHaveBeenCalledTimes(1)
        expect(errorSpy).toHaveBeenCalledWith(null)

        await waitTasks(tasksPool)

        expect(errorSpy).toHaveBeenCalledTimes(2)
        expect(errorSpy).toHaveBeenLastCalledWith('Failed: Connection refused')
        expect($error()).toBe('Failed: Connection refused')

        off()
      })

      it('should not fetch when disabled', async () => {
        const $disabled = signal(true)
        const { query } = client(
          tasks(tasksRunner(tasksPool))
        )
        const $postId = signal(1)
        const dataSpy = vi.fn()
        const fetcher = vi.fn(getPost)
        const [$data, , $loading] = query(PostKey, [$postId], fetcher, [
          disabled($disabled)
        ])
        const off = effect(() => {
          dataSpy($data())
        })

        expect(dataSpy).toHaveBeenCalledTimes(1)
        expect(dataSpy).toHaveBeenCalledWith(null)

        await waitTasks(tasksPool)

        expect(dataSpy).toHaveBeenCalledTimes(1)
        expect($loading()).toBe(false)
        expect(fetcher).not.toHaveBeenCalled()

        $disabled(false)

        await waitTasks(tasksPool)

        expect(dataSpy).toHaveBeenCalledTimes(2)
        expect(fetcher).toHaveBeenCalledTimes(1)
        expect($data()?.title).toBe('First Post')

        off()
      })

      it('should dedupe concurrent requests', async () => {
        const { query } = client(tasks(tasksRunner(tasksPool)))
        const $postId = signal(1)
        const dataSpy = vi.fn()
        const fetcher = vi.fn(getPost)
        const [$data] = query(PostKey, [$postId], fetcher)
        const off = effect(() => {
          dataSpy($data())
        })

        expect(dataSpy).toHaveBeenCalledTimes(1)
        expect(dataSpy).toHaveBeenCalledWith(null)
        expect(fetcher).toHaveBeenCalledTimes(1)

        $postId(2)

        expect(dataSpy).toHaveBeenCalledTimes(1)
        expect(dataSpy).toHaveBeenCalledWith(null)
        expect(fetcher).toHaveBeenCalledTimes(2)

        $postId(1)

        expect(dataSpy).toHaveBeenCalledTimes(1)
        expect(dataSpy).toHaveBeenCalledWith(null)
        expect(fetcher).toHaveBeenCalledTimes(2)

        await waitTasks(tasksPool)

        expect(dataSpy).toHaveBeenCalledTimes(2)
        expect(dataSpy).toHaveBeenLastCalledWith({
          id: 1,
          title: 'First Post',
          content: 'Hello World!'
        })
        expect($data()?.title).toBe('First Post')
        expect(fetcher).toHaveBeenCalledTimes(2)

        off()
      })

      it('should call onEveryError on error', async () => {
        const errorHandler = vi.fn()
        const { query } = client(
          tasks(tasksRunner(tasksPool)),
          onEveryError(errorHandler)
        )
        const $postId = signal(1)
        const dataSpy = vi.fn()
        const error = new Error('Server error')
        const failingFetcher = vi.fn().mockRejectedValue(error)
        const [$data] = query(PostKey, [$postId], failingFetcher)
        const off = effect(() => {
          dataSpy($data())
        })

        expect(dataSpy).toHaveBeenCalledTimes(1)
        expect(errorHandler).not.toHaveBeenCalled()

        await waitTasks(tasksPool)

        expect(dataSpy).toHaveBeenCalledTimes(1)
        expect(errorHandler).toHaveBeenCalledTimes(1)
        expect(errorHandler).toHaveBeenCalledWith(error, false)

        off()
      })

      it('should accept ctx as cache key', async () => {
        const {
          query,
          $data
        } = client(tasks(tasksRunner(tasksPool)))
        const PostsKey = queryKey<[cursor: number | undefined], PostsPage>('posts', () => [])
        const $cursor = signal<number | undefined>(undefined)
        const dataSpy = vi.fn()
        const [$posts, , $loading] = query(PostsKey, [$cursor], async (cursor, ctx) => {
          const posts = $data(ctx)
          const newPosts = await getPosts(cursor)

          return {
            ...newPosts,
            posts: [...posts?.posts || [], ...newPosts.posts]
          }
        }, [dedupe(false)])
        const off = effect(() => {
          dataSpy($posts())
        })

        expect(dataSpy).toHaveBeenCalledTimes(1)
        expect(dataSpy).toHaveBeenCalledWith(null)
        expect($loading()).toBe(true)

        await waitTasks(tasksPool)

        expect(dataSpy).toHaveBeenCalledTimes(2)
        expect(dataSpy).toHaveBeenCalledWith({
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
        })

        $cursor(2)

        expect(dataSpy).toHaveBeenCalledTimes(2)
        expect($loading()).toBe(true)

        await waitTasks(tasksPool)

        expect(dataSpy).toHaveBeenCalledTimes(3)
        expect(dataSpy).toHaveBeenCalledWith({
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
            },
            {
              id: 3,
              title: 'Third Post',
              content: 'Yet another post'
            }
          ],
          nextCursor: null
        })

        off()
      })
    })
  })
})
