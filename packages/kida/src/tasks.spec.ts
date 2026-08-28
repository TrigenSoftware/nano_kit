import {
  describe,
  it,
  expect
} from 'vitest'
import {
  signal,
  computed,
  mountable
} from 'agera'
import {
  onStart,
  start
} from './lifecycle.js'
import { record } from './record.js'
import {
  task,
  waitTasks
} from './tasks.js'

describe('kida', () => {
  describe('tasks', () => {
    describe('task', () => {
      it('should return the promise of a task function', async () => {
        const $data = mountable(signal(0))
        const promise = task($data, async () => {
          await Promise.resolve()

          $data(1)

          return 1
        })

        await expect(promise).resolves.toBe(1)
      })

      it('should accept a plain promise', async () => {
        const $data = mountable(signal(0))
        const promise = Promise.resolve().then(() => $data(1))

        expect(task($data, promise)).toBe(promise)

        await waitTasks($data)

        expect($data()).toBe(1)
      })

      it('should attach one task to several signals', async () => {
        const $a = mountable(signal<number | null>(null))
        const $b = mountable(signal<number | null>(null))

        void task([$a, $b], async () => {
          await Promise.resolve()

          $a(1)
          $b(2)
        })

        await waitTasks($a)

        expect($a()).toBe(1)

        await waitTasks($b)

        expect($b()).toBe(2)
      })
    })

    describe('waitTasks', () => {
      it('should wait a task through a plain signal chain', async () => {
        const $a = signal<number | null>(null)
        const $double = computed(() => ($a() ?? 0) * 2)

        void task($a, async () => {
          await Promise.resolve()

          $a(21)
        })

        expect($double()).toBe(0)

        await waitTasks($double)

        expect($double()).toBe(42)
      })

      it('should wait a task inherited through a computed chain', async () => {
        const $user = mountable(signal<string | null>(null))

        onStart($user, () => {
          void task($user, async () => {
            await Promise.resolve()

            $user('Dan')
          })
        })

        const $userName = computed(() => $user()?.toUpperCase() ?? null)
        const stop = start($userName)

        await waitTasks($userName)

        expect($userName()).toBe('DAN')

        stop()
      })

      it('should wait a task of a dependency mounted by a settled value', async () => {
        const $a = mountable(signal(false))
        const $b = mountable(signal<string | null>(null))

        onStart($a, () => {
          void task($a, async () => {
            await Promise.resolve()

            $a(true)
          })
        })
        onStart($b, () => {
          void task($b, async () => {
            await Promise.resolve()

            $b('done')
          })
        })

        const $c = computed(() => ($a() ? $b() : null))
        const stop = start($c)

        await waitTasks($c)

        expect($c()).toBe('done')

        stop()
      })

      it('should wait a task spawned by a task', async () => {
        const $data = mountable(signal(0))

        onStart($data, () => {
          void task($data, async () => {
            await Promise.resolve()

            $data(1)

            void task($data, async () => {
              await Promise.resolve()

              $data(2)
            })
          })
        })

        const stop = start($data)

        await waitTasks($data)

        expect($data()).toBe(2)

        stop()
      })

      it('should see an in-flight task from a second reader', async () => {
        const $shared = mountable(signal<string | null>(null))
        let calls = 0

        onStart($shared, () => {
          void task($shared, async () => {
            calls++

            await Promise.resolve()

            $shared('data')
          })
        })

        const $first = computed(() => $shared())
        const stopFirst = start($first)
        const $second = computed(() => $shared())
        const stopSecond = start($second)

        await waitTasks($second)

        expect($second()).toBe('data')
        expect(calls).toBe(1)

        stopFirst()
        stopSecond()
      })

      it('should wait through diamond dependencies', async () => {
        const $source = mountable(signal<number | null>(null))

        onStart($source, () => {
          void task($source, async () => {
            await Promise.resolve()

            $source(21)
          })
        })

        const $left = computed(() => $source() ?? 0)
        const $right = computed(() => $source() ?? 0)
        const $sum = computed(() => $left() + $right())
        const stop = start($sum)

        await waitTasks($sum)

        expect($sum()).toBe(42)

        stop()
      })

      it('should wait a task through a record key', async () => {
        const $profile = mountable(record(signal({
          name: ''
        })))

        onStart($profile, () => {
          void task($profile, async () => {
            await Promise.resolve()

            $profile({
              name: 'Dan'
            })
          })
        })

        const $name = computed(() => $profile.$name())
        const stop = start($name)

        await waitTasks($name)

        expect($name()).toBe('Dan')

        stop()
      })

      it('should not throw when a task rejects', async () => {
        const $data = mountable(signal<string | null>(null))
        const promise = task($data, async () => {
          await Promise.resolve()

          throw new Error('fail')
        })

        promise.catch(() => {})

        await waitTasks($data)

        expect($data()).toBe(null)
      })
    })
  })
})
