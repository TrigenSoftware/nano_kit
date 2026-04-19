import {
  vi,
  describe,
  it,
  expect,
  beforeEach
} from 'vitest'
import {
  type TasksPool,
  effect
} from '@nano_kit/store'
import {
  type MutationClientContext,
  dedupe,
  onEveryError
} from '../ClientContext.js'
import type { ClientSetting } from '../client.types.js'
import {
  onSuccess,
  onError,
  onSettled
} from '../RequestContext.js'
import {
  client,
  mutations
} from '../client.js'
import {
  type Post,
  type CreatePostParams,
  resetMockData,
  createPost
} from '../client.mock.js'

describe('query', () => {
  describe('queries', () => {
    describe('mutation', () => {
      const tasksPool: TasksPool = new Set()

      beforeEach(() => {
        tasksPool.clear()
        resetMockData()
      })

      it('should mutate on demand', async () => {
        const { mutation } = client(mutations())
        const dataSpy = vi.fn()
        const [mutate, $data, , $loading] = mutation(createPost)
        const off = effect(() => {
          dataSpy($data())
        })

        expect(dataSpy).toHaveBeenCalledTimes(1)
        expect(dataSpy).toHaveBeenCalledWith(null)

        const promise = mutate({
          title: 'New Post',
          content: 'New content'
        })

        expect($loading()).toBe(true)

        expect(await promise).toEqual([
          {
            id: 4,
            title: 'New Post',
            content: 'New content'
          },
          undefined
        ])

        expect(dataSpy).toHaveBeenCalledTimes(2)
        expect(dataSpy).toHaveBeenLastCalledWith({
          id: 4,
          title: 'New Post',
          content: 'New content'
        })
        expect($data()).toEqual({
          id: 4,
          title: 'New Post',
          content: 'New content'
        })
        expect($loading()).toBe(false)

        off()
      })

      it('should handle errors', async () => {
        const { mutation } = client(mutations())
        const dataSpy = vi.fn()
        const errorSpy = vi.fn()
        const failingMutator = vi.fn().mockRejectedValue(new Error('Create failed'))
        const [mutate, $data, $error, $loading] = mutation(failingMutator)
        const off = effect(() => {
          dataSpy($data())
          errorSpy($error())
        })

        expect(dataSpy).toHaveBeenCalledTimes(1)
        expect(dataSpy).toHaveBeenCalledWith(null)
        expect(errorSpy).toHaveBeenCalledWith(null)

        const promise = mutate({
          title: 'New Post',
          content: 'Content'
        })

        expect($loading()).toBe(true)

        expect(await promise).toEqual([undefined, expect.any(Error)])

        expect(dataSpy).toHaveBeenCalledTimes(2)
        expect(dataSpy).toHaveBeenLastCalledWith(null)
        expect(errorSpy).toHaveBeenLastCalledWith('Create failed')
        expect($data()).toBe(null)
        expect($error()).toBe('Create failed')
        expect($loading()).toBe(false)

        off()
      })

      it('should dedupe concurrent mutations by loading state', async () => {
        const { mutation } = client(mutations())
        const dataSpy = vi.fn()
        const mutator = vi.fn(createPost)
        const [mutate, $data, , $loading] = mutation(mutator)
        const off = effect(() => {
          dataSpy($data())
        })

        expect(dataSpy).toHaveBeenCalledTimes(1)
        expect(dataSpy).toHaveBeenCalledWith(null)

        const promise = mutate({
          title: 'First',
          content: ''
        })

        expect($loading()).toBe(true)

        const promise2 = mutate({
          title: 'Second',
          content: ''
        })

        expect(mutator).toHaveBeenCalledTimes(1)

        expect(await Promise.all([promise, promise2])).toEqual([
          [
            {
              id: 4,
              title: 'First',
              content: ''
            },
            undefined
          ],
          undefined
        ])

        expect(mutator).toHaveBeenCalledTimes(1)
        expect(dataSpy).toHaveBeenCalledTimes(2)
        expect(dataSpy).toHaveBeenLastCalledWith({
          id: 4,
          title: 'First',
          content: ''
        })
        expect($data()?.title).toBe('First')

        off()
      })

      it('should handle concurrent mutations', async () => {
        const { mutation } = client(mutations())
        const dataSpy = vi.fn()
        let latency = 200
        const mutator = vi.fn((params: CreatePostParams) => new Promise<Post>((resolve) => {
          setTimeout(() => {
            resolve(createPost(params))
          }, latency)
        }))
        const [mutate, $data, , $loading] = mutation(mutator, [dedupe(false)])
        const off = effect(() => {
          dataSpy($data())
        })

        expect(dataSpy).toHaveBeenCalledTimes(1)
        expect(dataSpy).toHaveBeenCalledWith(null)

        const promise = mutate({
          title: 'First',
          content: ''
        })

        expect($loading()).toBe(true)

        latency = 0

        const promise2 = mutate({
          title: 'Second',
          content: ''
        })

        expect(mutator).toHaveBeenCalledTimes(2)

        await Promise.all([promise, promise2])

        expect(mutator).toHaveBeenCalledTimes(2)
        expect(dataSpy).toHaveBeenCalledTimes(2)
        expect(dataSpy).toHaveBeenLastCalledWith({
          id: 4,
          title: 'Second',
          content: ''
        })
        expect($data()?.title).toBe('Second')

        off()
      })

      it('should call onSuccess callback', async () => {
        const { mutation } = client(mutations())
        const dataSpy = vi.fn()
        const successHandler = vi.fn()
        const [mutate, $data] = mutation<[params: CreatePostParams], Post>((params, ctx) => {
          onSuccess(ctx, successHandler)

          return createPost(params)
        })
        const off = effect(() => {
          dataSpy($data())
        })

        expect(dataSpy).toHaveBeenCalledTimes(1)
        expect(dataSpy).toHaveBeenCalledWith(null)
        expect(successHandler).not.toHaveBeenCalled()

        await mutate({
          title: 'Test',
          content: 'Content'
        })

        expect(dataSpy).toHaveBeenCalledTimes(2)
        expect(successHandler).toHaveBeenCalledTimes(1)
        expect(successHandler).toHaveBeenCalledWith({
          id: 4,
          title: 'Test',
          content: 'Content'
        })

        off()
      })

      it('should pass mapped data to success and settled callbacks', async () => {
        const { mutation } = client(mutations())
        const successHandler = vi.fn()
        const settledHandler = vi.fn()
        const mapPostData = ((ctx) => {
          ctx.mapData = data => ({
            ...data,
            title: `[mapped] ${data.title}`
          })
        }) as ClientSetting<MutationClientContext<Post>>
        const [mutate, $data] = mutation<[params: CreatePostParams], Post>((params, ctx) => {
          onSuccess(ctx, successHandler)
          onSettled(ctx, settledHandler)

          return createPost(params)
        }, [mapPostData])

        await mutate({
          title: 'Test',
          content: 'Content'
        })

        expect($data()).toEqual({
          id: 4,
          title: '[mapped] Test',
          content: 'Content'
        })
        expect(successHandler).toHaveBeenCalledTimes(1)
        expect(successHandler).toHaveBeenCalledWith({
          id: 4,
          title: '[mapped] Test',
          content: 'Content'
        })
        expect(settledHandler).toHaveBeenCalledTimes(1)
        expect(settledHandler).toHaveBeenCalledWith({
          id: 4,
          title: '[mapped] Test',
          content: 'Content'
        }, undefined)
      })

      it('should call onError callback', async () => {
        const { mutation } = client(mutations())
        const errorHandler = vi.fn()
        const error = new Error('Create failed')
        const [mutate] = mutation<[params: CreatePostParams], Post>((_params, ctx) => {
          onError(ctx, errorHandler)

          return Promise.reject(error)
        })

        expect(errorHandler).not.toHaveBeenCalled()

        await mutate({
          title: 'Test',
          content: ''
        })

        expect(errorHandler).toHaveBeenCalledTimes(1)
        expect(errorHandler).toHaveBeenCalledWith(error)
      })

      it('should call onSettled callback', async () => {
        const { mutation } = client(mutations())
        const dataSpy = vi.fn()
        const settledHandler = vi.fn()
        const [mutate, $data] = mutation<[params: CreatePostParams], Post>((params, ctx) => {
          onSettled(ctx, settledHandler)

          return createPost(params)
        })
        const off = effect(() => {
          dataSpy($data())
        })

        expect(dataSpy).toHaveBeenCalledTimes(1)
        expect(dataSpy).toHaveBeenCalledWith(null)
        expect(settledHandler).not.toHaveBeenCalled()

        await mutate({
          title: 'Test',
          content: 'Content'
        })

        expect(dataSpy).toHaveBeenCalledTimes(2)
        expect(settledHandler).toHaveBeenCalledTimes(1)
        expect(settledHandler).toHaveBeenCalledWith({
          id: 4,
          title: 'Test',
          content: 'Content'
        }, undefined)

        off()
      })

      it('should call onEveryError', async () => {
        const errorHandler = vi.fn()
        const { mutation } = client(
          onEveryError(errorHandler),
          mutations()
        )
        const dataSpy = vi.fn()
        const error = new Error('Global error')
        const failingMutator = vi.fn().mockRejectedValue(error)
        const [mutate, $data] = mutation(failingMutator)
        const off = effect(() => {
          dataSpy($data())
        })

        expect(dataSpy).toHaveBeenCalledTimes(1)
        expect(errorHandler).not.toHaveBeenCalled()

        await mutate({
          title: 'Test',
          content: ''
        })

        expect(dataSpy).toHaveBeenCalledTimes(1)
        expect(errorHandler).toHaveBeenCalledTimes(1)
        expect(errorHandler).toHaveBeenCalledWith(error, false)

        off()
      })
    })
  })
})
