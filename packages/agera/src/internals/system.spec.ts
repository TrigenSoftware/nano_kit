import {
  type MockInstance,
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach
} from 'vitest'
import type {
  Link,
  ReactiveNode
} from './types.js'
import {
  LinkEvent,
  UnlinkEvent,
  UpdateEvent,
  RunEvent,
  StopEvent,
  LifecycleEvent,
  FlushEvent
} from './flags.js'
import {
  signal,
  computed,
  effect,
  effectScope,
  untracked,
  batch,
  inspect
} from './system.js'
import { mountable } from '../modes.js'

type Event = [kind: number, target: ReactiveNode | Link | undefined]

const events: Event[] = []

inspect((kind, target) => {
  events.push([kind, target])
})

function of(kind: number, target?: ReactiveNode | Link) {
  return events.filter(([k, t]) => k === kind && (target === undefined || t === target))
}

describe('agera', () => {
  describe('internals', () => {
    describe('system', () => {
      let warn: MockInstance

      beforeEach(() => {
        warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      })

      afterEach(() => {
        vi.restoreAllMocks()
      })

      describe('signal', () => {
        it('should warn about a write inside a computed', () => {
          const $count = signal(0)
          const $bad = computed(() => {
            $count(1)

            return 1
          })

          $bad()

          expect(warn).toHaveBeenCalledTimes(1)
          expect(warn).toHaveBeenCalledWith(expect.stringContaining('computed'))
        })

        it('should not warn about a write inside an effect, a scope or untracked', () => {
          const $count = signal(0)
          const $double = computed(() => untracked(() => {
            $count(1)

            return $count() * 2
          }))
          const stop = effect(() => {
            $count(2)
          })
          const stopScope = effectScope(() => {
            $count(3)
          })

          $double()
          stop()
          stopScope()

          expect(warn).not.toHaveBeenCalled()
        })

        it('should not warn about a write inside an effect that was notified', () => {
          const $a = signal(0)
          const $b = signal(0)
          const stop = effect(() => {
            effect(() => {
              $a()
            })
            batch(() => {
              $a(1)
              $b(1)
            })
          })

          stop()

          expect(warn).not.toHaveBeenCalled()
        })
      })

      describe('effect', () => {
        it('should warn about an effect created inside a computed', () => {
          const $count = signal(0)
          const $bad = computed(() => {
            stop = effect(() => {
              $count()
            })

            return $count()
          })
          let stop = () => {}

          $bad()
          stop()

          expect(warn).toHaveBeenCalledTimes(1)
          expect(warn).toHaveBeenCalledWith(expect.stringContaining('effect was created'))
        })
      })

      describe('effectScope', () => {
        it('should warn about a scope created inside a computed', () => {
          const $count = signal(0)
          const $bad = computed(() => {
            stop = effectScope(() => {})

            return $count()
          })
          let stop = () => {}

          $bad()
          stop()

          expect(warn).toHaveBeenCalledTimes(1)
          expect(warn).toHaveBeenCalledWith(expect.stringContaining('scope was created'))
        })
      })

      describe('inspect', () => {
        beforeEach(() => {
          events.length = 0
        })

        it('should report a new link and its removal with the effect stop', () => {
          const $count = signal(0)
          const stop = effect(() => {
            $count()
          })
          const [link] = of(LinkEvent).map(([, target]) => target as Link)

          expect(link.dep).toBe($count.node)

          stop()

          expect(of(UnlinkEvent, link)).toHaveLength(1)
          expect(of(StopEvent, link.sub)).toHaveLength(1)
        })

        it('should report a committed write once and skip an equal write', () => {
          const $count = signal(0)

          effect(() => {
            $count()
          })
          events.length = 0
          $count(1)

          expect(of(UpdateEvent, $count.node)).toHaveLength(1)

          $count(1)

          expect(of(UpdateEvent, $count.node)).toHaveLength(1)
        })

        it('should report one update for writes collapsed by a batch', () => {
          const $count = signal(0)

          effect(() => {
            $count()
          })
          events.length = 0
          batch(() => {
            $count(1)
            $count(2)
          })

          expect(of(UpdateEvent, $count.node)).toHaveLength(1)
        })

        it('should report a run and an update for the first evaluation of a computed', () => {
          const $count = signal(1)
          const $double = computed(() => $count() * 2)

          expect(of(RunEvent, $double.node)).toHaveLength(0)

          $double()

          expect(of(RunEvent, $double.node)).toHaveLength(1)
          expect(of(UpdateEvent, $double.node)).toHaveLength(1)
        })

        it('should report a run without an update when a computed keeps its value', () => {
          const $count = signal(1)
          const $positive = computed(() => $count() > 0)

          effect(() => {
            $positive()
          })
          events.length = 0
          $count(2)

          expect(of(RunEvent, $positive.node)).toHaveLength(1)
          expect(of(UpdateEvent, $positive.node)).toHaveLength(0)
        })

        it('should report an update when a computed changes its value', () => {
          const $count = signal(1)
          const $double = computed(() => $count() * 2)

          effect(() => {
            $double()
          })
          events.length = 0
          $count(2)

          expect(of(RunEvent, $double.node)).toHaveLength(1)
          expect(of(UpdateEvent, $double.node)).toHaveLength(1)
        })

        it('should report effect re-runs but not the warmup run', () => {
          const $count = signal(0)

          effect(() => {
            $count()
          })

          const [link] = of(LinkEvent).map(([, target]) => target as Link)

          expect(of(RunEvent, link.sub)).toHaveLength(0)

          $count(1)

          expect(of(RunEvent, link.sub)).toHaveLength(1)
        })

        it('should report a flush once after a write outside a batch', () => {
          const $count = signal(0)

          effect(() => {
            $count()
          })
          events.length = 0
          $count(1)

          expect(of(FlushEvent)).toHaveLength(1)
        })

        it('should report mount and unmount transitions of a mountable signal', () => {
          const $count = mountable(signal(0))
          const stop = effect(() => {
            $count()
          })

          expect(of(LifecycleEvent, $count.node)).toHaveLength(1)

          stop()

          expect(of(LifecycleEvent, $count.node)).toHaveLength(2)
        })

        it('should compose listeners', () => {
          let calls = 0

          inspect(() => {
            calls++
          })

          const $count = signal(0)

          effect(() => {
            $count()
          })

          expect(calls).toBeGreaterThan(0)
          expect(calls).toBe(events.length)
        })
      })
    })
  })
})
