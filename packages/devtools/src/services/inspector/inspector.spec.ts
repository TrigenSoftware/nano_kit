import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach
} from 'vitest'
import {
  type ReactiveNode,
  LinkEvent,
  UnlinkEvent,
  UpdateEvent,
  RunEvent,
  RunEndEvent,
  StopEvent,
  LifecycleEvent,
  FlushEvent,
  InjectionContext,
  signal,
  computed,
  effect,
  effectScope,
  mountable,
  uninspected,
  batch,
  provide,
  inject,
  record
} from '@nano_kit/store'
import { LibraryDetector$ } from '../naming/index.js'
import { isWorkspaceLibrary } from '../naming/naming.mock.js'
import type {
  InspectorEvent,
  MeetInspectEvent
} from './inspector.types.js'
import {
  MeetEvent,
  InspectorService$
} from './inspector.js'

describe('devtools', () => {
  describe('services', () => {
    describe('inspector', () => {
      describe('InspectorService$', () => {
        let service: InspectorService$
        let batches: InspectorEvent[][]
        let stop: () => void
        const stops: (() => void)[] = []

        function create() {
          return inject(InspectorService$, new InjectionContext([provide(LibraryDetector$, isWorkspaceLibrary)]))
        }

        function watch(fn: () => void) {
          stops.push(effect(fn))
        }

        // The events of a task come a microtask after them
        function tick() {
          return Promise.resolve()
        }

        function heard() {
          return batches.flat()
        }

        function meetingOf(node: ReactiveNode) {
          return heard().find((event): event is InspectorEvent & MeetInspectEvent => event.kind === MeetEvent && event.node === node)
        }

        // The kinds of the events about a node, a link told of by its dependent
        function kindsAbout(node: ReactiveNode) {
          return heard()
            .filter(event => ('dep' in event ? event.sub : 'node' in event && event.node) === node)
            .map(event => event.kind)
        }

        beforeEach(() => {
          batches = []
          service = create()
          stop = service.listen((events) => {
            batches.push(events)
          })
        })

        afterEach(() => {
          stops.splice(0).forEach(off => off())
          stop()
        })

        it('should hand the events of a task over at once, a microtask after them, in their order', async () => {
          const $count = signal(0)

          watch(() => {
            $count()
          })
          $count(1)

          expect(batches).toEqual([])

          await tick()

          const reader = $count.node.subs!.sub

          expect(batches).toHaveLength(1)
          expect(batches[0].map(event => event.kind)).toEqual([
            MeetEvent,
            MeetEvent,
            LinkEvent,
            UpdateEvent,
            RunEvent,
            RunEndEvent,
            FlushEvent
          ])
          expect(batches[0][2]).toEqual({
            kind: LinkEvent,
            dep: $count.node,
            sub: reader,
            time: expect.any(Number)
          })
          expect(batches[0][3]).toEqual({
            kind: UpdateEvent,
            node: $count.node,
            oldValue: 0,
            time: expect.any(Number)
          })
        })

        it('should stamp every event with the time it was heard, in their order', async () => {
          const $count = signal(0)

          watch(() => {
            $count()
          })
          $count(1)

          await tick()

          const times = heard().map(event => event.time)

          expect(times).toEqual([...times].sort((a, b) => a - b))
        })

        it('should hand a flush over only after something of the application', async () => {
          batch(() => {})
          uninspected(() => {
            const $panel = signal(0)

            effect(() => {
              $panel()
            })
            $panel(1)
          })

          await tick()

          expect(heard()).toEqual([])
        })

        it('should call every listener with the same events, in the order they started', async () => {
          const calls: string[] = []
          const stopOther = service.listen((events) => {
            calls.push('other')
            expect(events).toBe(batches[0])
          })

          service.listen(() => {
            calls.push('last')
          })()
          signal(0)

          await tick()

          expect(calls).toEqual(['other'])
          expect(batches).toHaveLength(1)

          stopOther()
        })

        it('should meet a signal at its creation, with its signal and the stack of that moment', async () => {
          const $count = signal(0)

          await tick()

          const meeting = meetingOf($count.node)!

          expect(meeting.signal).toBe($count)
          expect(meeting.reached).toBe(false)
          expect(meeting.origin![0].stack).toContain('inspector.spec.ts')
          expect(meeting.parent).toBeUndefined()
        })

        it('should meet an effect on its first link, while its body runs', async () => {
          const $count = signal(0)

          watch(function logCount() {
            $count()
          })

          await tick()

          const meeting = meetingOf($count.node.subs!.sub)!

          expect(meeting.signal).toBeUndefined()
          expect(meeting.reached).toBe(false)
          expect(meeting.origin![0].stack).toContain('logCount')
        })

        it('should meet an effect created inside a scope, and the scope, on the stack of the body', async () => {
          const $count = signal(0)

          stops.push(effectScope(function scopeBody() {
            effect(function innerEffect() {
              $count()
            })
          }))

          await tick()

          const reader = $count.node.subs!.sub
          const owner = reader.subs!.sub

          expect(meetingOf(reader)!.reached).toBe(false)
          expect(meetingOf(reader)!.origin![0].stack).toContain('scopeBody')
          expect(meetingOf(owner)!.reached).toBe(false)
          expect(meetingOf(owner)!.origin![0].stack).toContain('scopeBody')
        })

        it('should meet a node once', async () => {
          const $count = signal(0)

          watch(() => {
            $count()
          })
          $count(1)

          await tick()

          expect(heard().filter(event => event.kind === MeetEvent)).toHaveLength(2)
        })

        it('should meet the parent of a child signal first, whatever its age', async () => {
          stop()

          const $user = record(signal({
            name: 'Dan'
          }))

          stop = service.listen((events) => {
            batches.push(events)
          })

          const $name = $user.$name

          await tick()

          const meetings = heard().filter(event => event.kind === MeetEvent)

          expect(meetings.map(event => event.node)).toEqual([$user.node, $name.node])
          expect(meetings[0].reached).toBe(true)
          expect(meetings[1]).toMatchObject({
            reached: false,
            parent: $user.node,
            key: 'name'
          })
        })

        it('should reach the nodes older than itself from a node that links to them, with their links', async () => {
          stop()

          const $old = signal(1)
          const $oldDouble = computed(() => $old() * 2)

          watch(() => {
            $oldDouble()
          })
          stop = service.listen((events) => {
            batches.push(events)
          })

          await tick()

          expect(heard()).toEqual([])

          watch(() => {
            $oldDouble()
          })

          await tick()

          const [oldReader, newReader] = [$oldDouble.node.subs!.sub, $oldDouble.node.subsTail!.sub]

          expect(meetingOf($oldDouble.node)).toMatchObject({
            reached: true,
            signal: undefined,
            origin: undefined
          })
          expect(meetingOf($old.node)?.reached).toBe(true)
          expect(meetingOf(oldReader)?.reached).toBe(true)
          expect(heard().filter(event => event.kind === MeetEvent)).toHaveLength(4)
          expect(heard()).toContainEqual({
            kind: LinkEvent,
            dep: $old.node,
            sub: $oldDouble.node,
            time: expect.any(Number)
          })
          expect(heard()).toContainEqual({
            kind: LinkEvent,
            dep: $oldDouble.node,
            sub: oldReader,
            time: expect.any(Number)
          })
          expect(heard()).toContainEqual({
            kind: LinkEvent,
            dep: $oldDouble.node,
            sub: newReader,
            time: expect.any(Number)
          })
        })

        it('should meet an effect that reads a node older than itself on the stack of its own body', async () => {
          stop()

          const $old = signal(1)

          stop = service.listen((events) => {
            batches.push(events)
          })
          watch(function logOld() {
            $old()
          })

          await tick()

          const meeting = meetingOf($old.node.subs!.sub)!

          expect(meeting.reached).toBe(false)
          expect(meeting.origin![0].stack).toContain('logOld')
          expect(meetingOf($old.node)?.reached).toBe(true)
        })

        it('should leave out the nodes created inside uninspected', async () => {
          const $hidden = uninspected(() => signal(0))
          const $shown = signal(0)

          watch(() => {
            $hidden()
            $shown()
          })

          await tick()

          expect(meetingOf($hidden.node)).toBeUndefined()
          expect(heard().filter(event => 'dep' in event)).toHaveLength(1)
        })

        it('should call the listener inside uninspected', async () => {
          let $created: ReturnType<typeof signal<number>> | undefined

          stop()
          stop = service.listen((events) => {
            batches.push(events)
            $created ??= signal(0)
          })
          signal(1)

          await tick()
          await tick()

          expect($created).toBeDefined()
          expect(meetingOf($created!.node)).toBeUndefined()
        })

        it('should tell of a stop and forget the node, links it drops included', async () => {
          const $count = signal(0)
          const off = effect(() => {
            $count()
          })

          await tick()

          const reader = $count.node.subs!.sub

          batches = []
          off()

          await tick()

          expect(heard()).toEqual([
            {
              kind: StopEvent,
              node: reader,
              time: expect.any(Number)
            }
          ])
        })

        it('should tell of the links a computed drops when it re-tracks', async () => {
          const $flag = signal(true)
          const $left = signal('left')
          const $right = signal('right')
          const $side = computed(() => ($flag() ? $left() : $right()))

          watch(() => {
            $side()
          })

          await tick()

          batches = []
          $flag(false)

          await tick()

          expect(heard()).toContainEqual({
            kind: UnlinkEvent,
            dep: $left.node,
            sub: $side.node,
            time: expect.any(Number)
          })
          expect(heard()).toContainEqual({
            kind: LinkEvent,
            dep: $right.node,
            sub: $side.node,
            time: expect.any(Number)
          })
        })

        it('should tell of mounting', async () => {
          const $user = mountable(signal('Dan'))

          watch(() => {
            $user()
          })

          await tick()

          expect(kindsAbout($user.node)).toEqual([MeetEvent, LifecycleEvent])
        })

        it('should be deaf until somebody listens', async () => {
          const other = create()
          const otherBatches: InspectorEvent[][] = []
          const $early = signal(0)
          const stopOther = other.listen((events) => {
            otherBatches.push(events)
          })
          const $late = signal(0)

          await tick()

          expect(otherBatches.flat().map(event => 'node' in event && event.node)).toEqual([$late.node])
          expect(meetingOf($early.node)).toBeDefined()

          stopOther()
        })

        it('should hand nothing over once stopped, what it heard before included', async () => {
          signal(0)
          stop()
          signal(0)

          await tick()

          expect(batches).toEqual([])
        })
      })
    })
  })
})
