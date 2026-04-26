import {
  vi,
  afterEach,
  beforeEach,
  describe,
  expect,
  it
} from 'vitest'
import {
  type TasksPool,
  effect,
  interval,
  signal,
  tasksRunner,
  waitTasks
} from '@nano_kit/store'
import { queryKey } from '../cache.js'
import { tasks } from '../ClientContext.js'
import { client } from '../client.js'
import {
  type Post,
  resetMockData,
  getPost
} from '../client.mock.js'
import { revalidateOn } from './revalidateOn.js'

const PostKey = queryKey<[id: number], Post | null>('post')

describe('query', () => {
  describe('settings', () => {
    describe('revalidateOn', () => {
      const tasksPool: TasksPool = new Set()

      beforeEach(() => {
        tasksPool.clear()
        resetMockData()
        vi.useFakeTimers()
      })

      afterEach(() => {
        vi.useRealTimers()
      })

      it('should revalidate on reactive conditions and interval', async () => {
        const { query } = client(tasks(tasksRunner(tasksPool)))
        const $id = signal(1)
        const $pageVisible = signal(true)
        const $networkOnline = signal(true)
        const $interval = interval(1000)
        const fetcher = vi.fn(getPost)
        const [$data] = query(PostKey, [$id], fetcher, [
          revalidateOn($pageVisible, $networkOnline, $interval)
        ])
        const off = effect(() => {
          $data()
        })

        await waitTasks(tasksPool)

        expect(fetcher).toHaveBeenCalledTimes(1)

        $pageVisible(false)
        await waitTasks(tasksPool)

        expect(fetcher).toHaveBeenCalledTimes(1)

        $pageVisible(true)
        await waitTasks(tasksPool)

        expect(fetcher).toHaveBeenCalledTimes(2)

        $networkOnline(false)
        await waitTasks(tasksPool)

        expect(fetcher).toHaveBeenCalledTimes(2)

        $networkOnline(true)
        await waitTasks(tasksPool)

        expect(fetcher).toHaveBeenCalledTimes(3)

        vi.advanceTimersByTime(1000)
        await waitTasks(tasksPool)

        expect(fetcher).toHaveBeenCalledTimes(4)

        off()

        vi.advanceTimersByTime(1000)
        await waitTasks(tasksPool)

        expect(fetcher).toHaveBeenCalledTimes(4)
      })

      it('should use current key value for reactive conditions and interval', async () => {
        const { query } = client(tasks(tasksRunner(tasksPool)))
        const $id = signal(1)
        const $pageVisible = signal(true)
        const $networkOnline = signal(true)
        const $interval = interval(1000)
        const fetcher = vi.fn(getPost)
        const [$data] = query(PostKey, [$id], fetcher, [
          revalidateOn($pageVisible, $networkOnline, $interval)
        ])
        const off = effect(() => {
          $data()
        })

        await waitTasks(tasksPool)

        expect(fetcher).toHaveBeenCalledTimes(1)
        expect(fetcher).toHaveBeenLastCalledWith(1, expect.anything())

        $id(2)
        await waitTasks(tasksPool)

        expect(fetcher).toHaveBeenCalledTimes(2)
        expect(fetcher).toHaveBeenLastCalledWith(2, expect.anything())

        $pageVisible(false)
        $pageVisible(true)
        await waitTasks(tasksPool)

        expect(fetcher).toHaveBeenCalledTimes(3)
        expect(fetcher).toHaveBeenLastCalledWith(2, expect.anything())

        $networkOnline(false)
        $networkOnline(true)
        await waitTasks(tasksPool)

        expect(fetcher).toHaveBeenCalledTimes(4)
        expect(fetcher).toHaveBeenLastCalledWith(2, expect.anything())

        vi.advanceTimersByTime(1000)
        await waitTasks(tasksPool)

        expect(fetcher).toHaveBeenCalledTimes(5)
        expect(fetcher).toHaveBeenLastCalledWith(2, expect.anything())

        off()
      })
    })
  })
})
