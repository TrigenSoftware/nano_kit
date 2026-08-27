import {
  describe,
  it,
  expect
} from 'vitest'
import {
  InjectionContext,
  run,
  inject
} from './di.js'
import {
  TasksPool$,
  TasksRunner$,
  waitCurrentTasks,
  waitTasks,
  tasksRunner
} from './tasks.js'

describe('kida', () => {
  describe('tasks', () => {
    describe('allTasks', () => {
      it('should wait resolved task', async () => {
        const tasks = new Set<Promise<unknown>>()
        const task = tasksRunner(tasks)
        let resolve: () => void
        const promise = task(() => new Promise<void>((r) => {
          resolve = r
        }))
        let stamp = ''
        const waitTasks = waitCurrentTasks(tasks)

        waitTasks.then(() => {
          stamp += ' allTasks '
        })
        promise.then(() => {
          stamp += ' task '
        })

        resolve!()
        await Promise.all([waitTasks, promise])

        expect(stamp).toBe(' task  allTasks ')
      })

      it('should wait rejected task', async () => {
        const tasks = new Set<Promise<unknown>>()
        const task = tasksRunner(tasks)
        let reject: () => void
        const promise = task(() => new Promise<void>((_, r) => {
          reject = r
        }))
        let stamp = ''
        const waitTasks = waitCurrentTasks(tasks)

        waitTasks.then(() => {
          stamp += ' allTasks '
        })
        promise.catch(() => {
          stamp += ' task '
        })

        reject!()
        await Promise.allSettled([waitTasks, promise])

        expect(stamp).toBe(' task  allTasks ')
      })
    })

    describe('TasksRunner$', () => {
      it('should run task within the pool from the injection context', async () => {
        const context = new InjectionContext()
        const [task, tasks] = run(context, () => [
          inject(TasksRunner$),
          inject(TasksPool$)
        ] as const)
        let done = false

        void task(async () => {
          await Promise.resolve()

          done = true
        })

        expect(tasks.size).toBe(1)

        await waitTasks(tasks)

        expect(done).toBe(true)
        expect(tasks.size).toBe(0)
      })
    })
  })
})
