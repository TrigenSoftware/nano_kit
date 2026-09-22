import {
  describe,
  it,
  expect,
  afterEach
} from 'vitest'
import {
  type ReactiveNode,
  signal,
  computed,
  effect,
  effectScope,
  mountable,
  record
} from '@nano_kit/store'
import type { NodeRecord } from './registry.types.js'
import {
  kindOf,
  parentOf,
  isOwnership,
  stateOf,
  valueOf,
  visitStale
} from './registry.js'

describe('devtools', () => {
  describe('services', () => {
    describe('registry', () => {
      const stops: (() => void)[] = []

      function watch(fn: () => void) {
        stops.push(effect(fn))
      }

      // What a record says about the node, as far as the functions under test read it
      function describeNode(node: ReactiveNode, links: Partial<Pick<NodeRecord, 'deps' | 'subs'>> = {}) {
        return {
          kind: kindOf(node),
          ref: new WeakRef(node),
          deps: [],
          subs: [],
          ...links
        } as unknown as NodeRecord
      }

      afterEach(() => {
        stops.splice(0).forEach(stop => stop())
      })

      describe('kindOf', () => {
        it('should tell a signal, a computed and a child signal apart', () => {
          const $count = signal(0)
          const $double = computed(() => $count() * 2)
          const $user = record(signal({
            name: 'Dan'
          }))

          expect(kindOf($count.node)).toBe('signal')
          expect(kindOf($double.node)).toBe('computed')
          expect(kindOf($user.$name.node)).toBe('child')
        })

        it('should tell an effect from the scope that owns it', () => {
          const $count = signal(0)

          stops.push(effectScope(() => {
            effect(() => {
              $count()
            })
          }))

          const reader = $count.node.subs!.sub
          const owner = reader.subs!.sub

          expect(kindOf(reader)).toBe('effect')
          expect(kindOf(owner)).toBe('scope')
        })
      })

      describe('parentOf', () => {
        it('should find the parent of a child signal and its key, and none for anything else', () => {
          const $user = record(signal({
            name: 'Dan'
          }))

          expect(parentOf($user.$name.node)).toEqual([$user.node, 'name'])
          expect(parentOf($user.node)).toBeUndefined()
        })
      })

      describe('isOwnership', () => {
        it('should take a link to an effect or a scope for ownership', () => {
          expect(['signal', 'computed', 'child', 'selector', 'effect', 'scope'].filter(kind => isOwnership({
            kind
          } as NodeRecord))).toEqual(['effect', 'scope'])
        })
      })

      describe('stateOf', () => {
        it('should tell a mounted node from an unmounted one', () => {
          const $count = mountable(signal(0))

          expect(stateOf(describeNode($count.node))).toBe('unmounted')

          watch(() => {
            $count()
          })

          expect(stateOf(describeNode($count.node))).toBe('mounted')
        })

        it('should tell a node somebody reads from a detached one', () => {
          const $count = signal(0)

          expect(stateOf(describeNode($count.node))).toBe('detached')
          expect(stateOf(describeNode($count.node, {
            subs: [1]
          }))).toBe('active')
        })

        it('should put a computed nobody evaluated and a node left out of date first', () => {
          const $count = signal(1)
          const $double = computed(() => $count() * 2)

          watch(() => {
            $count()
          })

          expect(stateOf(describeNode($double.node))).toBe('unevaluated')

          // Read by hand once: linked to the signal, pulled by no effect
          $double()

          expect(stateOf(describeNode($double.node))).toBe('detached')

          $count(2)

          expect(stateOf(describeNode($double.node))).toBe('dirty')
        })

        it('should call an effect busy while it has something to wait for', () => {
          const $count = signal(0)

          watch(() => {
            $count()
          })

          const reader = $count.node.subs!.sub

          expect(stateOf(describeNode(reader))).toBe('detached')
          expect(stateOf(describeNode(reader, {
            deps: [1]
          }))).toBe('active')
        })
      })

      describe('valueOf', () => {
        it('should read the value from the node and never evaluate it', () => {
          const $count = signal(1)
          const $double = computed(() => $count() * 2)

          expect(valueOf(describeNode($count.node))).toBe(1)
          expect(valueOf(describeNode($double.node))).toBeUndefined()

          $double()

          expect(valueOf(describeNode($double.node))).toBe(2)
        })

        it('should find no value in an effect', () => {
          const $count = signal(1)

          watch(() => {
            $count()
          })

          expect(valueOf(describeNode($count.node.subs!.sub))).toBeUndefined()
        })
      })

      describe('visitStale', () => {
        it('should visit what an update left out of date, through one another and once', () => {
          const $count = signal(1)
          const $double = computed(() => $count() * 2)
          const $label = computed(() => `${$double()}`)
          const $fresh = computed(() => $count() + 1)
          const visited: ReactiveNode[] = []
          const seen = new Set<ReactiveNode>()

          watch(() => {
            $count()
            $fresh()
          })
          // Read by hand once: linked to the signal, pulled by no effect
          $label()
          $count(2)
          visitStale($count.node, seen, stale => visited.push(stale))
          visitStale($count.node, seen, stale => visited.push(stale))

          expect(visited).toEqual([$double.node, $label.node])
        })
      })
    })
  })
})
