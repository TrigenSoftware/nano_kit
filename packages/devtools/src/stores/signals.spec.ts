import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach
} from 'vitest'
import {
  type ReactiveNode,
  STORE_UNMOUNT_DELAY,
  InjectionContext,
  signal,
  computed,
  effect,
  batch,
  uninspected,
  provide,
  inject,
  record
} from '@nano_kit/store'
import type { NodeRecord } from '../services/registry/index.js'
import { LibraryDetector$ } from '../services/naming/index.js'
import { isWorkspaceLibrary } from '../services/naming/naming.mock.js'
import { PanelStore$ } from './panel.js'
import { RegistryStore$ } from './registry.js'
import { SignalsStore$ } from './signals.js'

describe('devtools', () => {
  describe('stores', () => {
    describe('signals', () => {
      describe('SignalsStore$', () => {
        let panel: ReturnType<typeof PanelStore$>
        let registry: ReturnType<typeof RegistryStore$>
        let store: ReturnType<typeof SignalsStore$>
        let hide: () => void
        const stops: (() => void)[] = []

        // An effect of the application
        function watch(fn: () => void) {
          stops.push(effect(fn))
        }

        // A binding of the panel: out of the registry, like everything the panel creates
        function bind(fn: () => void) {
          stops.push(uninspected(() => effect(fn)))
        }

        // The table on the screen: the registry listens while somebody reads the groups.
        // Closing the panel stops the listening a while after the last reader left
        function show() {
          const stop = uninspected(() => effect(() => {
            store.$groups()
          }))

          return () => {
            vi.useFakeTimers()
            stop()
            vi.advanceTimersByTime(STORE_UNMOUNT_DELAY)
            vi.useRealTimers()
          }
        }

        // The events of a task are written a microtask after them
        function tick() {
          return Promise.resolve()
        }

        function idOf({ node }: { node: ReactiveNode }) {
          return registry.idOf(node)!
        }

        function recordOf($signal: { node: ReactiveNode }) {
          return registry.records.get(idOf($signal)) as NodeRecord
        }

        // What a row of the table reads: the record of the node, tracked
        function rowOf($signal: { node: ReactiveNode }) {
          const id = idOf($signal)

          return () => registry.records.$get(id)!
        }

        beforeEach(() => {
          uninspected(() => {
            const context = new InjectionContext([provide(LibraryDetector$, isWorkspaceLibrary)])

            panel = inject(PanelStore$, context)
            registry = inject(RegistryStore$, context)
            store = inject(SignalsStore$, context)
          })
          hide = show()
        })

        afterEach(() => {
          stops.splice(0).forEach(stop => stop())
          hide()
        })

        it('should group the records by the function they were created in, and leave effects out', async () => {
          function Cart$() {
            return {
              $items: signal<number[]>([]),
              $total: computed(() => 0)
            }
          }

          function User$() {
            return signal('Dan')
          }

          const { $items, $total } = Cart$()

          User$()
          watch(() => {
            $total()
          })

          await tick()

          expect(store.$groups().map(group => [group.owner, group.rows.length])).toEqual([
            ['Cart$', 2],
            ['User$', 1]
          ])
          expect(store.$groups()[0].file).toMatch(/\/signals\.spec\.ts$/)
          expect(store.$groups()[0].rows.map(row => row.id)).toEqual([idOf($items), idOf($total)])
        })

        it('should put the rows of child signals under their parent', async () => {
          function User$() {
            return record(signal({
              name: 'Dan'
            }))
          }

          const $user = User$()
          const $name = $user.$name

          await tick()

          const [group] = store.$groups()

          expect(group.rows.map(row => row.id)).toEqual([idOf($user)])
          expect(group.rows[0].children.map(row => row.id)).toEqual([idOf($name)])
        })

        it('should keep the rows the filter matches, by name, by site or by owner', async () => {
          function Cart$() {
            return signal(0)
          }

          function User$() {
            return record(signal({
              name: 'Dan'
            }))
          }

          Cart$()

          const $name = User$().$name

          await tick()

          panel.$filter(' CART$ ')

          expect(store.$groups().map(group => group.owner)).toEqual(['Cart$'])

          panel.$filter('signals.spec')

          expect(store.$groups()).toHaveLength(2)

          // A parent stays for the sake of a child that matches
          panel.$filter(recordOf($name).name.name.slice(-5))

          expect(store.$groups().map(group => group.rows.map(row => row.children.length))).toEqual([[1]])

          panel.$filter('no such thing')

          expect(store.$groups()).toEqual([])
        })

        it('should keep the rows the filter matches by value, as the value moves on', async () => {
          const $jam = signal('marmalade')
          const $fruit = signal('quince')
          const rows = () => store.$groups().flatMap(group => group.rows.map(row => row.id))

          watch(() => {
            $jam()
            $fruit()
          })

          await tick()

          panel.$filter('marmalade')

          expect(rows()).toEqual([idOf($jam)])

          $jam('quince')

          await tick()

          expect(rows()).toEqual([])

          panel.$filter('quince')

          expect(rows()).toEqual([idOf($jam), idOf($fruit)])
        })

        it('should rebuild the groups a microtask after the graph changed, once for all the changes', async () => {
          let builds = 0

          bind(() => {
            store.$groups()
            builds++
          })
          signal(1)
          signal(2)

          expect(builds).toBe(1)

          await tick()

          expect(builds).toBe(2)
          expect(store.$groups()[0].rows).toHaveLength(2)
        })

        it('should leave the groups alone when nothing came or went', async () => {
          const $count = signal(1)
          let builds = 0

          watch(() => {
            $count()
          })

          await tick()

          bind(() => {
            store.$groups()
            builds++
          })
          $count(2)

          await tick()

          expect(builds).toBe(1)
        })

        it('should run a binding again when its record changed, and leave the others alone', async () => {
          const $first = signal(1)
          const $second = signal(1)
          const runs = {
            first: 0,
            second: 0
          }

          watch(() => {
            $first()
            $second()
          })

          await tick()

          const $firstRecord = rowOf($first)
          const $secondRecord = rowOf($second)

          bind(() => {
            $firstRecord()
            runs.first++
          })
          bind(() => {
            $secondRecord()
            runs.second++
          })
          $first(2)

          expect(runs.first).toBe(1)

          await tick()

          expect(runs).toEqual({
            first: 2,
            second: 1
          })
        })

        it('should run the bindings of both ends of a new link once', async () => {
          const $count = signal(1)
          let runs = 0

          await tick()

          const $record = rowOf($count)

          bind(() => {
            $record()
            runs++
          })
          watch(() => {
            $count()
          })
          watch(() => {
            $count()
          })

          await tick()

          expect(runs).toBe(2)
          expect($record().subs).toHaveLength(2)
        })

        it('should evaluate a computed on request and leave no subscriber behind', async () => {
          const $count = signal(1)
          const compute = vi.fn(() => $count() * 2)
          const $cold = computed(compute)

          await tick()

          store.evaluate(recordOf($cold))

          expect(compute).toHaveBeenCalledTimes(1)

          await tick()

          // The record hears of the evaluation like of any other update
          expect(recordOf($cold).state).toBe('detached')
          expect(recordOf($cold).updates).toBe(1)
          expect(recordOf($cold).subs).toEqual([])
        })

        it('should follow the selection and prepare its links', async () => {
          const $count = signal(1)

          watch(() => {
            $count()
          })

          await tick()

          const source = recordOf($count)
          const [readerId] = source.subs

          store.select(readerId)

          expect(store.$selected()?.id).toBe(readerId)
          expect(store.$selectedDeps()).toEqual([source])
          expect(store.$selectedSubs()).toEqual([])
          expect(store.$isSelected(readerId)).toBe(true)
          expect(store.$isSelected(source.id)).toBe(false)

          store.select(undefined)

          expect(store.$isSelected(readerId)).toBe(false)
        })

        it('should keep a stopped effect selected, out of every link', async () => {
          const $count = signal(1)
          const stop = effect(() => {
            $count()
          })

          await tick()

          const [readerId] = recordOf($count).subs

          store.select(readerId)
          stop()

          await tick()

          expect(store.$selected()?.id).toBe(readerId)
          expect(store.$selectedDeps()).toEqual([])
        })

        it('should give the log of the selected record, newest first', async () => {
          const $count = signal(0)

          watch(() => {
            $count()
          })

          await tick()

          store.select(recordOf($count).id)
          // The Recent box on the screen: the log listens while it is read
          bind(() => {
            store.$selectedRecent()
          })
          $count(1)
          $count(2)

          await tick()

          expect(store.$selectedRecent().map(entry => [entry.group, entry.line.kind, entry.line.to])).toEqual([
            [2, 'write', '2'],
            [1, 'write', '1']
          ])
        })

        it('should drop the selection when the record leaves', async () => {
          const $count = signal(1)

          await tick()

          const { id } = recordOf($count)

          store.select(id)
          // The way the registry lets go of a node that was collected: inside a batch
          batch(() => {
            registry.records.delete(id)
          })

          expect(store.$selected()).toBeUndefined()
        })
      })
    })
  })
})
