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
  type ReactiveNode,
  type WritableSignal,
  STORE_UNMOUNT_DELAY,
  InjectionContext,
  IndexedSignalsMap,
  SignalsMap,
  signal,
  computed,
  effect,
  effectScope,
  mountable,
  onMount,
  uninspected,
  provide,
  inject,
  record
} from '@nano_kit/store'
import type { NodeRecord } from '../services/registry/index.js'
import { LibraryDetector$ } from '../services/naming/index.js'
import { isWorkspaceLibrary } from '../services/naming/naming.mock.js'
import { RegistryStore$ } from './registry.js'

describe('devtools', () => {
  describe('stores', () => {
    describe('registry', () => {
      describe('RegistryStore$', () => {
        let store: ReturnType<typeof RegistryStore$>
        let hide: () => void
        const stops: (() => void)[] = []

        function create() {
          return uninspected(() => inject(RegistryStore$, new InjectionContext([provide(LibraryDetector$, isWorkspaceLibrary)])))
        }

        // An effect of the application
        function watch(fn: () => void) {
          stops.push(effect(fn))
        }

        // The panel on the screen: the registry listens while somebody reads its records.
        // Closing it stops the listening a while after the last reader left
        function show() {
          const stop = uninspected(() => effect(() => {
            store.records.$index()
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

        // The events of a task are written a microtask after them
        function tick() {
          return Promise.resolve()
        }

        function recordOf({ node }: { node: ReactiveNode }) {
          const id = store.idOf(node)

          return id === undefined ? undefined : store.records.get(id)
        }

        // The nodes a signals map keeps to itself: its version, which stands for it, and the signal of an entry
        function versionOf(map: SignalsMap<string, number>) {
          return (map as unknown as { $v: AnySignal }).$v
        }

        function entryOf(map: SignalsMap<string, number>, key: string) {
          return Map.prototype.get.call(map, key) as AnySignal
        }

        function recordsOf(ids: number[]) {
          return ids.map(id => store.records.get(id) as NodeRecord)
        }

        beforeEach(() => {
          store = create()
          hide = show()
        })

        afterEach(() => {
          stops.splice(0).forEach(stop => stop())
          hide()
        })

        it('should write nothing until a microtask after the events', async () => {
          const $count = signal(0)

          expect(store.idOf($count.node)).toBeUndefined()

          await tick()

          expect(recordOf($count)?.id).toBe(store.idOf($count.node))
        })

        it('should record the signals and computeds created while the panel is open', async () => {
          const $count = signal(0)
          const $double = computed(() => $count() * 2)

          await tick()

          expect(recordOf($count)?.kind).toBe('signal')
          expect(recordOf($double)?.kind).toBe('computed')
          expect(recordOf($double)?.signal?.deref()).toBe($double)
          expect(recordOf($double)?.ref.deref()).toBe($double.node)
        })

        it('should name a record after the function and the place the node was created in', async () => {
          function Cart$() {
            return signal(0)
          }

          const $cart = Cart$()

          await tick()

          const { name } = recordOf($cart)!

          expect(name.name).toMatch(/^[a-z]+-[a-z]+$/)
          expect(name.owner).toBe('Cart$')
          expect(name.site).toMatch(/^registry\.spec\.ts:\d+$/)
        })

        it('should give a node libraries created inside the body of a computed the owner of the computed', async () => {
          const entries: WritableSignal<number>[] = []
          // A body in no file of the application, the way a library runs one: the frames of evaluated code are left out
          // oxlint-disable-next-line eslint/no-new-func, typescript/no-implied-eval
          const readEntry = new Function('signal', 'entries', 'return () => entries.push(signal(0))')(signal, entries) as () => number

          function Cache$() {
            return computed(readEntry)
          }

          Cache$()()

          await tick()

          const { name } = recordOf(entries[0])!

          expect(name.owner).toBe('Cache$')
          expect(name.site).toBeUndefined()
        })

        it('should put the entries of a signals map under the map, named after it and their keys', async () => {
          const map = new SignalsMap<string, number>()

          map.set('foo', 42)

          await tick()

          const version = recordOf(versionOf(map))!
          const entry = recordOf(entryOf(map, 'foo'))!

          expect(version.kind).toBe('map')
          expect(entry.parent).toBe(version.id)
          expect(entry.name.name).toBe(`${version.name.name}["foo"]`)
        })

        it('should give a node libraries create in a lifecycle listener the owner of the node it listens to', async () => {
          const entries: WritableSignal<number>[] = []
          // A listener in no file of the application, the way a library runs one: the frames of evaluated code are left out
          // oxlint-disable-next-line eslint/no-new-func, typescript/no-implied-eval
          const listener = new Function('signal', 'entries', 'return () => { entries.push(signal(0)) }')(signal, entries) as () => void

          function Cache$() {
            const $data = mountable(signal(0))

            onMount($data, listener)

            return $data
          }

          const $data = Cache$()

          watch(() => {
            $data()
          })

          await tick()

          expect(recordOf(entries[0])!.name.owner).toBe('Cache$')
        })

        it('should show the index of an indexed map with the map, and keep its anchor out', async () => {
          const map = new IndexedSignalsMap<string, number>()

          watch(() => {
            map.$index()
          })

          await tick()

          const version = recordOf(versionOf(map))!
          const [index] = recordsOf(store.records.$index()).filter(record => record.parent === version.id)

          expect(index.kind).toBe('computed')
          expect(index.name.name).toBe(`${version.name.name}.$index`)
          // The index wears the node of the anchor
          expect(recordOf(map.$index)).toBeUndefined()
        })

        it('should count a new value of an entry as a new value of its map', async () => {
          const map = new SignalsMap<string, number>()

          map.set('foo', 1)
          watch(() => {
            map.$get('foo')
          })

          await tick()

          const { updates } = recordOf(versionOf(map))!

          map.set('foo', 2)

          await tick()

          expect(recordOf(versionOf(map))!.updates).toBe(updates + 1)
        })

        it('should keep a map busy while one of its entries is read', async () => {
          const map = new SignalsMap<string, number>()

          map.set('foo', 42)

          await tick()

          expect(recordOf(versionOf(map))!.state).toBe('detached')

          watch(() => {
            map.$get('foo')
          })

          await tick()

          expect(recordOf(versionOf(map))!.state).toBe('active')
        })

        it('should let an entry go with its key, as its readers let it go', async () => {
          const map = new SignalsMap<string, number>()

          map.set('foo', 42)
          watch(() => {
            map.$get('foo')
          })

          const entry = entryOf(map, 'foo')

          await tick()

          map.delete('foo')

          await tick()

          expect(recordOf(entry)).toBeUndefined()
        })

        it('should put a child signal under its parent and name it after the parent and the key', async () => {
          const $user = record(signal({
            name: 'Dan'
          }))
          const $name = $user.$name

          await tick()

          const parent = recordOf($user)!
          const child = recordOf($name)!

          expect(child.kind).toBe('child')
          expect(child.parent).toBe(parent.id)
          expect(child.name.name).toBe(`${parent.name.name}.$name`)
        })

        it('should record an effect on its first link, with the edge to what it reads, named after its body', async () => {
          const $count = signal(0)

          watch(function logCount() {
            $count()
          })

          await tick()

          const source = recordOf($count)!
          const [reader] = recordsOf(source.subs)

          expect(source.subs).toHaveLength(1)
          expect(source.reached).toBe(false)
          expect(reader.reached).toBe(false)
          expect(reader.kind).toBe('effect')
          expect(reader.deps).toEqual([source.id])
          expect(reader.signal).toBeUndefined()
          expect(reader.name.owner).toBe('logCount')
          expect(reader.name.site).toMatch(/^registry\.spec\.ts:\d+$/)
        })

        it('should keep ownership apart from dependencies', async () => {
          const $count = signal(0)

          stops.push(effectScope(() => {
            effect(() => {
              $count()
            })
          }))

          await tick()

          const [reader] = recordsOf(recordOf($count)!.subs)
          const [owner] = recordsOf([reader.owner!])

          expect(owner.kind).toBe('scope')
          expect(owner.owned).toEqual([reader.id])
          expect(owner.deps).toEqual([])
          expect(reader.subs).toEqual([])
        })

        it('should keep the record of a stopped effect, out of every link', async () => {
          const $count = signal(0)
          const stop = effect(() => {
            $count()
          })

          await tick()

          const reader = $count.node.subs!.sub
          const { id } = store.recordOf(reader)!

          stop()

          await tick()

          expect(store.recordOf(reader)).toMatchObject({
            id,
            deps: []
          })
          expect(recordOf($count)!.subs).toEqual([])
        })

        it('should keep the records of a stopped scope and of its effects, out of every link', async () => {
          const $count = signal(0)
          const stop = effectScope(() => {
            effect(() => {
              $count()
            })
          })

          await tick()

          const [readerId] = recordOf($count)!.subs
          const [reader] = recordsOf([readerId])

          stop()

          await tick()

          expect(recordsOf([readerId, reader.owner!])).toMatchObject([
            {
              deps: [],
              owner: undefined
            },
            {
              owned: []
            }
          ])
          expect(recordOf($count)!.subs).toEqual([])
        })

        it('should follow a computed that re-tracks to another dependency', async () => {
          const $flag = signal(true)
          const $left = signal('left')
          const $right = signal('right')
          const $side = computed(() => ($flag() ? $left() : $right()))

          watch(() => {
            $side()
          })

          await tick()

          expect(recordOf($side)!.deps).toContain(recordOf($left)!.id)
          expect(recordOf($side)!.deps).not.toContain(recordOf($right)!.id)

          $flag(false)

          await tick()

          expect(recordOf($side)!.deps).not.toContain(recordOf($left)!.id)
          expect(recordOf($side)!.deps).toContain(recordOf($right)!.id)
          expect(recordOf($left)!.subs).toEqual([])
        })

        it('should reach the nodes older than the panel from a node that links to them', async () => {
          hide()

          const $old = signal(1)
          const $oldDouble = computed(() => $old() * 2)

          watch(() => {
            $oldDouble()
          })
          hide = show()

          await tick()

          expect(store.idOf($old.node)).toBeUndefined()

          watch(() => {
            $oldDouble()
          })

          await tick()

          const old = recordOf($old)!
          const oldDouble = recordOf($oldDouble)!

          expect(oldDouble.deps).toEqual([old.id])
          expect(old.subs).toEqual([oldDouble.id])
          expect(old.reached).toBe(true)
          expect(old.signal).toBeUndefined()
          expect(old.name.site).toBeUndefined()
          expect(oldDouble.reached).toBe(true)
          expect(recordsOf(oldDouble.subs).map(sub => sub.kind)).toEqual(['effect', 'effect'])
        })

        it('should give the parent of a child signal a record whatever its age', async () => {
          hide()

          const $user = record(signal({
            name: 'Dan'
          }))

          hide = show()

          const $name = $user.$name

          await tick()

          expect(recordOf($user)!.reached).toBe(true)
          expect(recordOf($name)!.parent).toBe(recordOf($user)!.id)
        })

        it('should leave out the nodes created inside uninspected', async () => {
          const $hidden = uninspected(() => signal(0))
          const $shown = signal(0)

          watch(() => {
            $hidden()
            $shown()
          })

          await tick()

          const [reader] = recordsOf(recordOf($shown)!.subs)

          expect(store.idOf($hidden.node)).toBeUndefined()
          expect(reader.deps).toHaveLength(1)
        })

        it('should keep the state of a record current', async () => {
          const $user = mountable(signal('Dan'))
          const $count = signal(1)
          const $double = computed(() => $count() * 2)

          await tick()

          expect(recordOf($user)!.state).toBe('unmounted')
          expect(recordOf($double)!.state).toBe('unevaluated')

          watch(() => {
            $user()
            $count()
          })
          // Read by hand once: linked to the signal, pulled by no effect
          $double()

          await tick()

          expect(recordOf($user)!.state).toBe('mounted')
          expect(recordOf($count)!.state).toBe('active')
          expect(recordOf($double)!.state).toBe('detached')

          $count(2)

          await tick()

          // What an update left out of date got no event of its own
          expect(recordOf($double)!.state).toBe('dirty')
        })

        it('should count the updates of a value and give a new record for each', async () => {
          const $count = signal(1)

          watch(() => {
            $count()
          })

          await tick()

          const before = recordOf($count)!

          $count(2)

          await tick()

          expect(before.updates).toBe(0)
          expect(recordOf($count)!.updates).toBe(1)
          expect(recordOf($count)).not.toBe(before)
        })

        it('should listen only while somebody reads the records', async () => {
          hide()

          const $before = signal(0)

          await tick()

          expect(store.idOf($before.node)).toBeUndefined()
          expect(store.records.size).toBe(0)

          hide = show()

          const $after = signal(0)

          await tick()

          expect(store.idOf($after.node)).toBeDefined()
        })

        it('should keep listening a while after the last reader left', async () => {
          const stop = uninspected(() => effect(() => {
            store.records.$index()
          }))

          hide()
          stop()

          const $count = signal(0)

          await tick()

          expect(store.idOf($count.node)).toBeDefined()
        })
      })
    })
  })
})
