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
  operationKey,
  queryKey
} from '../cache.js'
import {
  dedupe,
  tasks
} from '../ClientContext.js'
import {
  client,
  operations
} from '../client.js'
import { RequestContext } from '../RequestContext.js'
import {
  type Post,
  resetMockData,
  getPost
} from '../client.mock.js'
import {
  abortable,
  abortSignal,
  abort,
  abortPrevious
} from './abortable.js'

const PostKey = queryKey<[id: number], Post | null>('post')

describe('query', () => {
  describe('settings', () => {
    describe('abortable', () => {
      const tasksPool: TasksPool = new Set()

      beforeEach(() => {
        tasksPool.clear()
        resetMockData()
      })

      describe('abortSignal', () => {
        it('should return AbortSignal for RequestContext', () => {
          const ctx = new RequestContext()
          const signal = abortSignal(ctx)

          expect(signal).toBeInstanceOf(AbortSignal)
          expect(signal.aborted).toBe(false)
        })

        it('should return same AbortSignal for same RequestContext', () => {
          const ctx = new RequestContext()
          const signal1 = abortSignal(ctx)
          const signal2 = abortSignal(ctx)

          expect(signal1).toBe(signal2)
        })

        it('should return different AbortSignals for different RequestContexts', () => {
          const ctx1 = new RequestContext()
          const ctx2 = new RequestContext()
          const signal1 = abortSignal(ctx1)
          const signal2 = abortSignal(ctx2)

          expect(signal1).not.toBe(signal2)
        })
      })

      describe('abort', () => {
        it('should abort request by RequestContext', () => {
          const ctx = new RequestContext()
          const signal = abortSignal(ctx)

          expect(signal.aborted).toBe(false)

          abort(ctx)

          expect(signal.aborted).toBe(true)
        })

        it('should do nothing if no AbortController associated', () => {
          const ctx = new RequestContext()

          expect(() => abort(ctx)).not.toThrow()
        })
      })

      describe('abortPrevious', () => {
        it('should abort previous RequestContext', () => {
          const prevCtx = new RequestContext()
          const ctx = new RequestContext(prevCtx)
          const prevSignal = abortSignal(prevCtx)

          expect(prevSignal.aborted).toBe(false)

          abortPrevious(ctx)

          expect(prevSignal.aborted).toBe(true)
        })
      })

      describe('abortable setting', () => {
        it('should abort previous request when new query starts', async () => {
          const { query } = client(tasks(tasksRunner(tasksPool)))
          const $id = signal(1)
          const fetcher = vi.fn(async (id: number, ctx) => {
            abortPrevious(ctx)

            const signal = abortSignal(ctx)
            const post = await getPost(id)

            if (signal.aborted) {
              throw new Error('Request aborted')
            }

            return post
          })
          const [$data, $error] = query(PostKey, [$id], fetcher, [abortable()])
          const dataSpy = vi.fn()
          const errorSpy = vi.fn()
          const off = effect(() => {
            dataSpy($data())
            errorSpy($error())
          })

          expect(dataSpy).toHaveBeenCalledTimes(1)
          expect(dataSpy).toHaveBeenCalledWith(null)
          expect(errorSpy).toHaveBeenCalledTimes(1)
          expect(errorSpy).toHaveBeenCalledWith(null)

          await waitTasks(tasksPool)

          expect(fetcher).toHaveBeenCalledTimes(1)
          expect(dataSpy).toHaveBeenCalledTimes(2)
          expect(dataSpy).toHaveBeenCalledWith({
            id: 1,
            title: 'First Post',
            content: 'Hello World!'
          })
          expect(errorSpy).toHaveBeenCalledTimes(2)
          expect(errorSpy).toHaveBeenCalledWith(null)
          expect($data()?.id).toBe(1)

          $id(2)
          $id(3)

          expect(dataSpy).toHaveBeenCalledTimes(3)
          expect(dataSpy).toHaveBeenCalledWith(null)
          expect(errorSpy).toHaveBeenCalledTimes(3)
          expect(errorSpy).toHaveBeenCalledWith(null)

          await waitTasks(tasksPool)

          expect(fetcher).toHaveBeenCalledTimes(3)
          expect(dataSpy).toHaveBeenCalledTimes(4)
          expect(dataSpy).toHaveBeenCalledWith({
            id: 3,
            title: 'Third Post',
            content: 'Yet another post'
          })
          expect(errorSpy).toHaveBeenCalledTimes(4)
          expect(errorSpy).toHaveBeenCalledWith(null)
          expect($data()?.id).toBe(3)

          off()
        })

        it('should abort promise returned by fetcher', async () => {
          const { operation } = client(
            operations(),
            dedupe(false),
            tasks(tasksRunner(tasksPool))
          )
          const PostLazyKey = operationKey<[], [id: number], Post | null>('post')
          const fetcher = vi.fn(async (id: number, ctx) => {
            const signal = abortSignal(ctx)
            const post = await getPost(id)

            if (signal.aborted) {
              throw new Error('Request aborted')
            }

            return post
          })
          const [fetch, $data, $error] = operation(PostLazyKey, [], fetcher, [abortable()])
          const dataSpy = vi.fn()
          const errorSpy = vi.fn()
          const off = effect(() => {
            dataSpy($data())
            errorSpy($error())
          })

          expect(dataSpy).toHaveBeenCalledTimes(1)
          expect(dataSpy).toHaveBeenCalledWith(null)
          expect(errorSpy).toHaveBeenCalledTimes(1)
          expect(errorSpy).toHaveBeenCalledWith(null)

          await fetch(1)

          expect(fetcher).toHaveBeenCalledTimes(1)
          expect(dataSpy).toHaveBeenCalledTimes(2)
          expect(dataSpy).toHaveBeenCalledWith({
            id: 1,
            title: 'First Post',
            content: 'Hello World!'
          })
          expect(errorSpy).toHaveBeenCalledTimes(2)
          expect(errorSpy).toHaveBeenCalledWith(null)
          expect($data()?.id).toBe(1)

          const fetchPromise = fetch(2)

          abort(fetchPromise)

          const result = await fetchPromise

          expect(result).toBeUndefined()
          expect(fetcher).toHaveBeenCalledTimes(2)
          expect(dataSpy).toHaveBeenCalledTimes(2)
          expect(dataSpy).toHaveBeenCalledWith({
            id: 1,
            title: 'First Post',
            content: 'Hello World!'
          })
          expect(errorSpy).toHaveBeenCalledTimes(2)
          expect(errorSpy).toHaveBeenCalledWith(null)
          expect($data()?.id).toBe(1)

          off()
        })
      })
    })
  })
})
