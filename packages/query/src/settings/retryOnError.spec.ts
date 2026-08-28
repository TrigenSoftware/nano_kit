import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach
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
  resetMockData
} from '../client.mock.js'
import {
  retryOnError,
  defaultCalcRetryDelay
} from './retryOnError.js'

const PostKey = queryKey<[id: number], Post | null>('post')

describe('query', () => {
  describe('settings', () => {
    describe('retryOnError', () => {
      beforeEach(() => {
        resetMockData()
        vi.useFakeTimers()
      })

      afterEach(() => {
        vi.useRealTimers()
      })

      describe('defaultCalcRetryDelay', () => {
        it('should return delay based on retry count', () => {
          vi.spyOn(Math, 'random').mockReturnValue(0.5)

          expect(defaultCalcRetryDelay(1)).toBe(4000)
          expect(defaultCalcRetryDelay(2)).toBe(8000)
          expect(defaultCalcRetryDelay(3)).toBe(16000)

          vi.restoreAllMocks()
        })

        it('should cap at 8 retries', () => {
          vi.spyOn(Math, 'random').mockReturnValue(0.5)

          const delay8 = defaultCalcRetryDelay(8)
          const delay9 = defaultCalcRetryDelay(9)
          const delay10 = defaultCalcRetryDelay(10)

          expect(delay8).toBe(delay9)
          expect(delay9).toBe(delay10)

          vi.restoreAllMocks()
        })
      })

      describe('retryOnError', () => {
        it('should retry on error after delay', async () => {
          const { query } = client()
          const $id = signal(1)
          const calcDelay = vi.fn().mockReturnValue(1000)
          const fetcher = vi.fn().mockRejectedValue(new Error('test error'))
          const [$data] = query(PostKey, [$id], fetcher, [retryOnError(calcDelay)])
          const off = effect(() => {
            $data()
          })

          await waitTasks($data)

          expect(fetcher).toHaveBeenCalledTimes(1)
          expect(calcDelay).toHaveBeenCalledTimes(1)
          expect(calcDelay).toHaveBeenCalledWith(1, expect.any(Error))

          vi.advanceTimersByTime(1000)

          await waitTasks($data)

          expect(fetcher).toHaveBeenCalledTimes(2)

          off()
        })

        it('should increment retry count on each error', async () => {
          const { query } = client()
          const $id = signal(1)
          const calcDelay = vi.fn().mockReturnValue(1000)
          const fetcher = vi.fn().mockRejectedValue(new Error('error'))
          const [$data] = query(PostKey, [$id], fetcher, [retryOnError(calcDelay)])
          const off = effect(() => {
            $data()
          })

          await waitTasks($data)

          expect(calcDelay).toHaveBeenLastCalledWith(1, expect.any(Error))

          vi.advanceTimersByTime(1000)
          await waitTasks($data)

          expect(calcDelay).toHaveBeenLastCalledWith(2, expect.any(Error))

          vi.advanceTimersByTime(1000)
          await waitTasks($data)

          expect(calcDelay).toHaveBeenLastCalledWith(3, expect.any(Error))

          off()
        })

        it('should reset retry count on success', async () => {
          const { query } = client()
          const $id = signal(1)
          const calcDelay = vi.fn().mockReturnValue(1000)
          const fetcher = vi.fn()
            .mockRejectedValueOnce(new Error('error 1'))
            .mockRejectedValueOnce(new Error('error 2'))
            .mockResolvedValueOnce({
              id: 1,
              title: 'Post',
              content: 'Content'
            })
            .mockRejectedValueOnce(new Error('error after success'))
          const [$data] = query(PostKey, [$id], fetcher, [retryOnError(calcDelay)])
          const off = effect(() => {
            $data()
          })

          await waitTasks($data)

          expect(calcDelay).toHaveBeenLastCalledWith(1, expect.any(Error))

          vi.advanceTimersByTime(1000)
          await waitTasks($data)

          expect(calcDelay).toHaveBeenLastCalledWith(2, expect.any(Error))

          vi.advanceTimersByTime(1000)
          await waitTasks($data)

          expect(fetcher).toHaveBeenCalledTimes(3)

          $id(2)
          $id(1)
          await waitTasks($data)

          expect(calcDelay).toHaveBeenLastCalledWith(1, expect.any(Error))

          off()
        })

        it('should cancel pending retry on new request', async () => {
          const { query } = client()
          const $id = signal(1)
          const calcDelay = vi.fn().mockReturnValue(5000)
          const fetcher = vi.fn()
            .mockRejectedValueOnce(new Error('test error'))
            .mockResolvedValue({
              id: 1,
              title: 'Post',
              content: 'Content'
            })
          const [$data] = query(PostKey, [$id], fetcher, [retryOnError(calcDelay)])
          const off = effect(() => {
            $data()
          })

          await waitTasks($data)

          expect(fetcher).toHaveBeenCalledTimes(1)

          $id(2)
          $id(1)
          await waitTasks($data)

          expect(fetcher).toHaveBeenCalledTimes(2)

          vi.advanceTimersByTime(5000)
          await waitTasks($data)

          expect(fetcher).toHaveBeenCalledTimes(2)

          off()
        })

        it('should use default calcRetryDelay if not provided', async () => {
          const { query } = client()
          const $id = signal(1)
          const fetcher = vi.fn().mockRejectedValue(new Error('test error'))
          const [$data] = query(PostKey, [$id], fetcher, [retryOnError()])
          const off = effect(() => {
            $data()
          })

          vi.spyOn(Math, 'random').mockReturnValue(0.5)

          await waitTasks($data)

          expect(fetcher).toHaveBeenCalledTimes(1)

          vi.advanceTimersByTime(4000)
          await waitTasks($data)

          expect(fetcher).toHaveBeenCalledTimes(2)

          vi.restoreAllMocks()
          off()
        })
      })
    })
  })
})
