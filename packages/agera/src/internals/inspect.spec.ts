import {
  describe,
  it,
  expect,
  beforeEach
} from 'vitest'
import type {
  ReactiveNode,
  WritableSignal,
  InspectEvent,
  LinkInspectEvent
} from './types.js'
import {
  UninspectedMode,
  LinkEvent,
  UnlinkEvent,
  UpdateEvent,
  RunEvent,
  StopEvent,
  LifecycleEvent,
  FlushEvent,
  RunEndEvent
} from './flags.js'
import {
  signal,
  computed,
  effect,
  deferEffect,
  deferScope,
  startScope,
  untracked,
  batch,
  selector
} from './system.js'
import {
  inspect,
  uninspected
} from './inspect.js'
import { mountable } from '../modes.js'

const events: InspectEvent[] = []

inspect((event) => {
  events.push(event)
})

function of(kind: number, node?: ReactiveNode) {
  return events.filter(event => event.kind === kind && (node === undefined || ('node' in event && event.node === node)))
}

function links(kind: LinkInspectEvent['kind']) {
  return events.filter((event): event is LinkInspectEvent => event.kind === kind)
}

describe('agera', () => {
  describe('internals', () => {
    describe('inspect', () => {
      describe('inspect', () => {
        beforeEach(() => {
          events.length = 0
        })

        it('should report a new link and its removal with the effect stop', () => {
          const $count = signal(0)
          const stop = effect(() => {
            $count()
          })
          const [link] = links(LinkEvent)

          expect(link.dep).toBe($count.node)

          stop()

          expect(links(UnlinkEvent)).toEqual([
            {
              kind: UnlinkEvent,
              dep: link.dep,
              sub: link.sub
            }
          ])
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

        it('should pass the value a signal had before its update', () => {
          const $count = signal(0)

          effect(() => {
            $count()
          })
          events.length = 0
          batch(() => {
            $count(1)
            $count(2)
          })

          expect(of(UpdateEvent, $count.node)).toEqual([
            {
              kind: UpdateEvent,
              node: $count.node,
              oldValue: 0
            }
          ])
          expect($count.node.value).toBe(2)
        })

        it('should pass the value a computed had before its update, and leave it out with its first evaluation', () => {
          const $count = signal(1)
          const $double = computed(() => $count() * 2)

          effect(() => {
            $double()
          })
          $count(2)

          const [first, next] = of(UpdateEvent, $double.node)

          expect('oldValue' in first).toBe(false)
          expect(next).toEqual({
            kind: UpdateEvent,
            node: $double.node,
            oldValue: 2
          })
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

          const [link] = links(LinkEvent)

          expect(of(RunEvent, link.sub)).toHaveLength(0)
          expect(of(RunEndEvent, link.sub)).toHaveLength(0)

          $count(1)

          expect(of(RunEvent, link.sub)).toHaveLength(1)
          expect(of(RunEndEvent, link.sub)).toHaveLength(1)
        })

        it('should end the run of a computed after its update', () => {
          const $count = signal(1)
          const $double = computed(() => $count() * 2)

          effect(() => {
            $double()
          })
          events.length = 0
          $count(2)

          expect(events.filter(event => 'node' in event && event.node === $double.node).map(event => event.kind)).toEqual([
            RunEvent,
            UpdateEvent,
            RunEndEvent
          ])
        })

        it('should enclose the runs an effect causes between its run and its end', () => {
          const $count = signal(1)
          const $double = computed(() => $count() * 2)

          effect(() => {
            $count()
            $double()
          })

          const [link] = links(LinkEvent)

          events.length = 0
          $count(2)

          expect(events
            .filter(event => event.kind === RunEvent || event.kind === RunEndEvent)
            .map(event => [event.kind, 'node' in event && event.node === link.sub ? 'effect' : 'computed'])).toEqual([
            [RunEvent, 'effect'],
            [RunEvent, 'computed'],
            [RunEndEvent, 'computed'],
            [RunEndEvent, 'effect']
          ])
        })

        it('should end a run whose body threw', () => {
          const $broken = computed(() => {
            throw new Error('broken')
          })

          expect(() => $broken()).toThrow('broken')
          expect(of(RunEvent, $broken.node)).toHaveLength(1)
          expect(of(RunEndEvent, $broken.node)).toHaveLength(1)
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
          const oldValues: unknown[] = []
          let calls = 0

          inspect((event) => {
            calls++

            if (event.kind === UpdateEvent) {
              oldValues.push(event.oldValue)
            }
          })

          const $count = signal(0)

          effect(() => {
            $count()
          })
          $count(1)

          expect(calls).toBeGreaterThan(0)
          expect(calls).toBe(events.length)
          expect(oldValues).toEqual([0])
        })
      })

      describe('uninspected', () => {
        function reported() {
          return events.filter(event => event.kind !== FlushEvent)
        }

        beforeEach(() => {
          events.length = 0
        })

        it('should report nothing about the nodes created inside', () => {
          uninspected(() => {
            const $count = mountable(signal(0))
            const $double = computed(() => $count() * 2)
            const stop = effect(() => {
              $double()
            })

            $count(1)
            stop()
          })

          expect(reported()).toHaveLength(0)
        })

        it('should report nothing about the keys of a selector read inside', () => {
          uninspected(() => {
            // Mountable: a key of a selector relays liveness, so it has a mount state to report
            const $selected = mountable(signal(1))
            const $isSelected = selector($selected)
            const stop = effect(() => {
              $isSelected(1)
              $isSelected(2)
            })

            $selected(2)
            stop()
          })

          expect(reported()).toHaveLength(0)
        })

        it('should mark the nodes created inside and return the result', () => {
          const $inside = uninspected(() => signal(0))
          const $outside = signal(0)

          expect($inside.node.modes & UninspectedMode).toBe(UninspectedMode)
          expect($outside.node.modes & UninspectedMode).toBe(0)
        })

        it('should keep out the nodes a later run of an uninspected effect creates', () => {
          const $trigger = uninspected(() => signal(0))
          let $late: WritableSignal<number> | undefined

          uninspected(() => {
            effect(() => {
              if ($trigger()) {
                const $created = $late = signal(0)

                effect(() => {
                  $created()
                })
              }
            })
          })

          $trigger(1)
          $late!(1)

          expect($late!.node.modes & UninspectedMode).toBe(UninspectedMode)
          expect(reported()).toHaveLength(0)
        })

        it('should keep out the nodes created under untracked in an uninspected effect', () => {
          const $trigger = uninspected(() => signal(0))
          let $late: WritableSignal<number> | undefined

          uninspected(() => {
            effect(() => {
              if ($trigger()) {
                untracked(() => {
                  $late = signal(0)
                })
              }
            })
          })

          $trigger(1)

          expect($late!.node.modes & UninspectedMode).toBe(UninspectedMode)
        })

        it('should keep out the nodes a deferred effect of an uninspected scope creates on start', () => {
          let $late: WritableSignal<number> | undefined
          const scope = uninspected(() => deferScope(() => {
            deferEffect(() => {
              $late = signal(0)
            })
          }))

          expect($late).toBeUndefined()

          startScope(scope)

          expect($late!.node.modes & UninspectedMode).toBe(UninspectedMode)
          expect(reported()).toHaveLength(0)
        })

        it('should report an inspected computed that an uninspected effect evaluates', () => {
          const $count = signal(1)
          const $double = computed(() => $count() * 2)

          uninspected(() => {
            effect(() => {
              untracked($double)
            })
          })

          expect(of(RunEvent, $double.node)).toHaveLength(1)
          expect(of(UpdateEvent, $double.node)).toHaveLength(1)
          expect(of(LinkEvent)).toHaveLength(1)
        })

        it('should skip a link with an uninspected end', () => {
          const $hidden = uninspected(() => signal(0))

          effect(() => {
            $hidden()
          })

          expect(of(LinkEvent)).toHaveLength(0)
        })

        it('should restore inspection after the function throws', () => {
          expect(() => uninspected(() => {
            throw new Error('boom')
          })).toThrow('boom')

          const $count = signal(0)

          effect(() => {
            $count()
          })

          expect($count.node.modes & UninspectedMode).toBe(0)
          expect(of(LinkEvent)).toHaveLength(1)
        })
      })
    })
  })
})
