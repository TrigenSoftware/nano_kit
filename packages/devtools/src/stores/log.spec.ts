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
  batch,
  uninspected,
  provide,
  inject
} from '@nano_kit/store'
import { LibraryDetector$ } from '../services/naming/index.js'
import { isWorkspaceLibrary } from '../services/naming/naming.mock.js'
import { RegistryStore$ } from './registry.js'
import { PanelStore$ } from './panel.js'
import {
  LOG_GROUPS,
  LogStore$
} from './log.js'

describe('devtools', () => {
  describe('stores', () => {
    describe('log', () => {
      describe('LogStore$', () => {
        let registry: ReturnType<typeof RegistryStore$>
        let panel: ReturnType<typeof PanelStore$>
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
            panel = inject(PanelStore$, context)
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

        it('should show every group while the filter is empty', async () => {
          const $count = signal(0)

          watch(() => {
            $count()
          })
          $count(1)

          await tick()

          expect(log.$shown()).toBe(log.$groups())
        })

        it('should show the groups with a line of a node the filter finds, cut down to such lines', async () => {
          const $count = signal(0)
          const $other = signal(0)

          watch(() => {
            $count()
            $other()
          })
          batch(() => {
            $count(1)
            $other(1)
          })
          $other(2)

          await tick()

          const { name } = registry.recordOf($count.node)!.name

          panel.$filter(name.toUpperCase())

          expect(log.$shown().map(group => group.lines.map(line => line.record.name.name))).toEqual([[name]])
        })

        it('should cut a group down once while the filter stays the same', async () => {
          const $count = signal(0)

          watch(() => {
            $count()
          })
          $count(1)

          await tick()

          panel.$filter(registry.recordOf($count.node)!.name.name)

          const [cut] = log.$shown()

          $count(2)

          await tick()

          expect(log.$shown()[1]).toBe(cut)
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
