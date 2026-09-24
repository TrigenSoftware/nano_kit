import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach
} from 'vitest'
import {
  type AnySignal,
  STORE_UNMOUNT_DELAY,
  InjectionContext,
  signal,
  effect,
  uninspected,
  provide,
  inject
} from '@nano_kit/store'
import { LibraryDetector$ } from '../services/naming/index.js'
import { isWorkspaceLibrary } from '../services/naming/naming.mock.js'
import { RegistryStore$ } from './registry.js'
import {
  LOG_GROUPS,
  LogStore$
} from './log.js'

describe('devtools', () => {
  describe('stores', () => {
    describe('log', () => {
      describe('LogStore$', () => {
        let registry: ReturnType<typeof RegistryStore$>
        let log: ReturnType<typeof LogStore$>
        let hide: () => void
        const stops: (() => void)[] = []

        // Somebody reads the signal of the panel: a store listens while it is read
        function read($signal: AnySignal) {
          const stop = uninspected(() => effect(() => {
            $signal()
          }))
          let hidden = false

          return () => {
            if (!hidden) {
              hidden = true
              vi.useFakeTimers()
              stop()
              vi.advanceTimersByTime(STORE_UNMOUNT_DELAY)
              vi.useRealTimers()
            }
          }
        }

        // An effect of the application
        function watch(fn: () => void) {
          stops.push(effect(fn))
        }

        // The events of a task are handed over a microtask after them
        function tick() {
          return Promise.resolve()
        }

        function ids() {
          return log.$groups().map(group => group.id)
        }

        beforeEach(() => {
          const context = new InjectionContext([provide(LibraryDetector$, isWorkspaceLibrary)])
          const hideRecords = uninspected(() => {
            registry = inject(RegistryStore$, context)

            // The registry listens first, the way the panel reads its records from the start
            return read(registry.records.$index)
          })
          const hideLog = uninspected(() => {
            log = inject(LogStore$, context)

            return read(log.$groups)
          })

          hide = () => {
            hideLog()
            hideRecords()
          }
        })

        afterEach(() => {
          stops.splice(0).forEach(stop => stop())
          hide()
        })

        it('should keep the groups newest first', async () => {
          const $count = signal(0)

          watch(() => {
            $count()
          })
          $count(1)
          $count(2)

          await tick()

          expect(ids()).toEqual([2, 1])
        })

        it('should keep no more groups than its limit, letting the oldest go', async () => {
          const $count = signal(0)

          watch(() => {
            $count()
          })

          for (let value = 1; value <= LOG_GROUPS + 5; value++) {
            $count(value)
          }

          await tick()

          expect(ids()).toHaveLength(LOG_GROUPS)
          expect(ids()[0]).toBe(LOG_GROUPS + 5)
        })

        it('should add nothing while paused, and go on once resumed', async () => {
          const $count = signal(0)

          watch(() => {
            $count()
          })

          await tick()

          const before = ids()

          log.pause()
          $count(1)

          await tick()

          expect(ids()).toEqual(before)

          log.resume()
          $count(2)

          await tick()

          expect(ids()).toHaveLength(before.length + 1)
        })

        it('should empty on clear and number the groups to come on', async () => {
          const $count = signal(0)

          watch(() => {
            $count()
          })
          $count(1)

          await tick()

          const [last] = ids()

          log.clear()

          expect(ids()).toEqual([])

          $count(2)

          await tick()

          expect(ids()).toEqual([last + 1])
        })

        it('should listen only while somebody reads the groups', async () => {
          hide()

          const $count = signal(0)

          watch(() => {
            $count()
          })
          $count(1)

          await tick()

          expect(ids()).toEqual([])
        })
      })
    })
  })
})
