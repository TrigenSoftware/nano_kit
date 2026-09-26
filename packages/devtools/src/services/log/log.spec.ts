import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach
} from 'vitest'
import {
  STORE_UNMOUNT_DELAY,
  InjectionContext,
  signal,
  computed,
  effect,
  mountable,
  uninspected,
  batch,
  provide,
  inject
} from '@nano_kit/store'
import { RegistryStore$ } from '../../stores/registry.js'
import { InspectorService$ } from '../inspector/index.js'
import { LibraryDetector$ } from '../naming/index.js'
import { isWorkspaceLibrary } from '../naming/naming.mock.js'
import type {
  LogGroup,
  LogLineKind
} from './log.types.js'
import {
  GROUP_LINES,
  RECENT_LINES,
  groupEvents,
  recentOf,
  filterGroup
} from './log.js'

describe('devtools', () => {
  describe('services', () => {
    describe('log', () => {
      describe('groupEvents', () => {
        let registry: ReturnType<typeof RegistryStore$>
        let inspector: InspectorService$
        let groups: LogGroup[]
        let stopLog: () => void
        let hide: () => void
        const stops: (() => void)[] = []

        // An effect of the application
        function watch(fn: () => void) {
          const stop = effect(fn)

          stops.push(stop)

          return stop
        }

        // The events of a task are handed over a microtask after them
        function tick() {
          return Promise.resolve()
        }

        // Work that takes a while
        function spin(ms: number) {
          const until = performance.now() + ms
          let spins = 0

          while (performance.now() < until) {
            spins++
          }

          return spins
        }

        function linesOf(group: LogGroup) {
          return group.lines.map(line => [line.kind, line.record.id, line.depth])
        }

        beforeEach(() => {
          const context = new InjectionContext([provide(LibraryDetector$, isWorkspaceLibrary)])
          let nextId = 1

          groups = []
          registry = uninspected(() => inject(RegistryStore$, context))

          // The registry listens first, the way the panel reads its records from the start
          const stopReading = uninspected(() => effect(() => {
            registry.records.$index()
          }))

          inspector = inject(InspectorService$, context)
          stopLog = inspector.listen((events) => {
            groups.push(...groupEvents(events, registry.recordOf, () => nextId++))
          })

          hide = () => {
            vi.useFakeTimers()
            stopReading()
            vi.advanceTimersByTime(STORE_UNMOUNT_DELAY)
            vi.useRealTimers()
          }
        })

        afterEach(() => {
          stops.splice(0).forEach(stop => stop())
          stopLog()
          hide()
        })

        it('should close a group with each flush and number the groups on', async () => {
          const $count = signal(0)

          watch(() => {
            $count()
          })
          $count(1)
          $count(2)

          await tick()

          expect(groups.map(group => group.id)).toEqual([1, 2])
          expect(groups.every(group => group.duration! >= 0)).toBe(true)
          expect(groups.map(group => group.counts.write)).toEqual([1, 1])
        })

        it('should tell a transaction the panel made from a reaction of the application', async () => {
          const $count = signal(1)
          const $double = computed(() => $count() * 2)

          watch(() => {
            $count()
          })

          await tick()
          groups.length = 0
          // The way the panel evaluates a computed on the word of the user: inside an action
          batch(() => {
            inspector.act(() => {
              $double()
            })
          })
          $count(2)

          await tick()

          expect(groups.map(group => group.panel)).toEqual([true, false])
          expect(groups[0].counts.computed).toBe(1)
        })

        it('should write a signal from its value before to the one the next write found', async () => {
          const $count = signal(0)

          watch(() => {
            $count()
          })
          $count(1)
          $count(2)

          await tick()

          expect(groups.map(group => group.lines.filter(line => line.kind === 'write').map(line => [line.from, line.to]))).toEqual([
            [['0', '1']],
            [['1', '2']]
          ])
        })

        it('should put a computed that ran and changed on one line, and mark its first evaluation', async () => {
          const $count = signal(1)
          const $double = computed(() => $count() * 2)

          watch(() => {
            $double()
          })
          $count(2)

          await tick()

          const [first, next] = groups.flatMap(group => group.lines.filter(line => line.kind === 'computed'))

          expect(first).toMatchObject({
            first: true,
            to: '2'
          })
          expect(first.from).toBeUndefined()
          expect(next).toMatchObject({
            from: '2',
            to: '4'
          })
        })

        it('should time a run and leave the runs nested in it out of its own time', async () => {
          const $count = signal(1)
          const $double = computed(() => {
            spin(1)

            return $count() * 2
          })

          watch(() => {
            $count()
            $double()
          })

          await tick()

          groups = []
          $count(2)

          await tick()

          const [group] = groups
          const run = group.lines.find(line => line.kind === 'effect')!
          const nested = group.lines.find(line => line.kind === 'computed')!

          expect(nested.depth).toBe(run.depth + 1)
          expect(nested.total).toBeGreaterThanOrEqual(1)
          expect(run.total).toBeGreaterThanOrEqual(nested.total!)
          expect(run.self).toBeCloseTo(run.total! - nested.total!)
          expect(group.duration).toBeGreaterThanOrEqual(run.total!)
        })

        it('should name the slowest run of a group by its own time', async () => {
          const $count = signal(1)
          const $slow = computed(() => {
            spin(2)

            return $count() + 1
          })

          watch(() => {
            $count()
          })
          watch(() => {
            $slow()
          })

          await tick()

          groups = []
          $count(2)

          await tick()

          expect(groups[0].slowest?.record.id).toBe(registry.idOf($slow.node))
        })

        it('should tell of what an update left out of date and nobody has read since', async () => {
          const $count = signal(1)
          const $double = computed(() => $count() * 2)

          watch(() => {
            $count()
          })
          // Read by hand once: linked to the signal, pulled by no effect
          $double()

          await tick()

          groups = []
          $count(2)

          await tick()

          expect(linesOf(groups[0])).toContainEqual(['invalidated', registry.idOf($double.node), 0])
        })

        it('should put what came after the last flush of a task into a group of its own, with no duration', async () => {
          const $count = signal(0)
          const stop = watch(() => {
            $count()
          })

          await tick()

          const effectId = registry.idOf($count.node.subs!.sub)

          groups = []
          stop()

          await tick()

          expect(groups).toHaveLength(1)
          expect(groups[0].duration).toBeUndefined()
          expect(linesOf(groups[0])).toEqual([['stopped', effectId, 0]])
        })

        it('should tell of mounting', async () => {
          const $user = mountable(signal('Dan'))

          watch(() => {
            $user()
          })

          await tick()

          const line = groups.flatMap(group => group.lines).find(line => line.kind === 'lifecycle')

          expect(line?.record.id).toBe(registry.idOf($user.node))
          expect(line?.mounted).toBe(true)
        })

        it('should keep a group to its limit of lines and count them all', async () => {
          const $count = signal(0)
          const $signals = Array.from({
            length: GROUP_LINES + 10
          }, () => signal(0))

          watch(() => {
            $count()
            $signals.forEach($signal => $signal())
          })

          await tick()

          groups = []
          batch(() => {
            $signals.forEach($signal => $signal(1))
          })

          await tick()

          const [group] = groups

          expect(group.counts.write).toBe(GROUP_LINES + 10)
          expect(group.lines).toHaveLength(GROUP_LINES)
        })

        it('should leave out a group with nothing to tell', async () => {
          signal(0)

          await tick()

          expect(groups).toEqual([])
        })
      })

      describe('recentOf', () => {
        // A group of the log with a write for each pair of the id of a node and the value it got
        function groupOf(id: number, writes: [node: number, to: string][]) {
          return {
            id,
            lines: writes.map(([node, to]) => ({
              kind: 'write',
              record: {
                id: node
              },
              depth: 0,
              to
            }))
          } as unknown as LogGroup
        }

        it('should give the lines of a node, newest first, with the number of their group', () => {
          const recent = recentOf([
            groupOf(2, [[1, '3'], [2, 'other'], [1, '4']]),
            groupOf(1, [[1, '1'], [1, '2']])
          ], 1)

          expect(recent.map(entry => [entry.group, entry.line.to])).toEqual([
            [2, '4'],
            [2, '3'],
            [1, '2'],
            [1, '1']
          ])
        })

        it('should give no more lines of a node than its limit', () => {
          const writes = Array.from({
            length: RECENT_LINES + 5
          }, (_, index): [number, string] => [1, String(index)])

          expect(recentOf([groupOf(1, writes)], 1)).toHaveLength(RECENT_LINES)
        })
      })

      describe('filterGroup', () => {
        // A transaction of `Cart$` with a line for each node, named, of a kind, with its own time for a run
        const group = {
          id: 1,
          lines: ([
            ['quiet-otter', 'write'],
            ['soft-frog', 'computed', 2, '1483', '1572'],
            ['quiet-dove', 'effect', 1]
          ] as [string, LogLineKind, number?, string?, string?][]).map(([name, kind, self, from, to]) => ({
            kind,
            record: {
              name: {
                name,
                site: `${name}.ts:1`,
                owner: 'Cart$'
              }
            },
            depth: 0,
            self,
            from,
            to
          }))
        } as unknown as LogGroup

        it('should cut a group down to the lines of the nodes the filter finds, with their counts and slowest run', () => {
          const cut = filterGroup(group, 'quiet')!

          expect(cut.lines.map(line => line.record.name.name)).toEqual(['quiet-otter', 'quiet-dove'])
          expect(cut.counts).toMatchObject({
            write: 1,
            computed: 0,
            effect: 1
          })
          expect(cut.slowest?.record.name.name).toBe('quiet-dove')
        })

        it('should find a node by its creation site', () => {
          expect(filterGroup(group, 'soft-frog.ts')?.lines).toHaveLength(1)
        })

        it('should find a line by a value it tells of, before or after', () => {
          expect(filterGroup(group, '1483')?.lines.map(line => line.record.name.name)).toEqual(['soft-frog'])
          expect(filterGroup(group, '1572')?.lines.map(line => line.record.name.name)).toEqual(['soft-frog'])
        })

        it('should give the group itself when every line matches', () => {
          expect(filterGroup(group, 'cart$')).toBe(group)
        })

        it('should give nothing when no line matches', () => {
          expect(filterGroup(group, 'user$')).toBeUndefined()
        })
      })
    })
  })
})
