import {
  describe,
  it,
  expect
} from 'vitest'
import { render } from '@nanoviews/testing-library'
import {
  signal,
  effect,
  batch,
  deferScope,
  startScope,
  stopScope,
  inject,
  getContext
} from 'kida'
import {
  button,
  div,
  span
} from '../elements/elements.js'
import { if_ } from '../flow/if.js'
import { for_ } from '../flow/for.js'
import { context } from '../component/context.js'

describe('nanoviews', () => {
  describe('internals', () => {
    describe('effects', () => {
      describe('mount order', () => {
        it('should run condition content effects before parent effects', () => {
          const log: string[] = []

          function Child() {
            effect(() => {
              log.push('child')
            })

            return span()('child')
          }

          function Parent() {
            effect(() => {
              log.push('parent')
            })

            return div()(
              if_(signal(true))(
                () => Child()
              )
            )
          }

          render(() => Parent())

          expect(log).toEqual(['child', 'parent'])
        })

        it('should run loop item effects in order before parent effects', () => {
          const log: string[] = []

          function Row($item: () => number) {
            effect(() => {
              log.push(`row ${$item()}`)
            })

            return span()(String($item()))
          }

          function Parent() {
            effect(() => {
              log.push('parent')
            })

            return div()(
              for_(signal([1, 2]))(
                $item => Row($item)
              )
            )
          }

          render(() => Parent())

          expect(log).toEqual([
            'row 1',
            'row 2',
            'parent'
          ])
        })

        it('should not run content effects before mount', () => {
          const log: string[] = []

          function Child() {
            effect(() => {
              log.push('child')
            })

            return span()('child')
          }

          const scope = deferScope(() => {
            div()(
              if_(signal(true))(
                () => Child()
              )
            )
          })

          expect(log).toEqual([])

          startScope(scope)

          expect(log).toEqual(['child'])

          stopScope(scope)
        })

        it('should keep sibling blocks start order on condition change before mount', () => {
          const log: string[] = []
          const $condition = signal(true)
          const Block = (name: string) => {
            effect(() => {
              log.push(name)
            })

            return span()(name)
          }
          const scope = deferScope(() => {
            div()(
              if_($condition)(
                () => Block('then'),
                () => Block('else')
              ),
              if_(signal(true))(
                () => Block('sibling')
              )
            )
          })

          // swap before mount must not move the block to the parent deps tail
          $condition(false)

          startScope(scope)

          expect(log).toEqual(['else', 'sibling'])

          stopScope(scope)
        })

        it('should keep sibling blocks destroy order after condition change', () => {
          const log: string[] = []
          const $condition = signal(true)
          const Block = (name: string) => {
            effect(() => () => {
              log.push(`${name} destroy`)
            })

            return span()(name)
          }
          const scope = deferScope(() => {
            div()(
              if_($condition)(
                () => Block('then'),
                () => Block('else')
              ),
              if_(signal(true))(
                () => Block('sibling')
              )
            )
          })

          startScope(scope)

          $condition(false)

          log.length = 0
          stopScope(scope)

          expect(log).toEqual(['else destroy', 'sibling destroy'])
        })

        it('should destroy previous content effects before new content effects run', () => {
          const log: string[] = []
          const $condition = signal(true)
          const Block = (name: string) => {
            effect(() => {
              log.push(`${name} run`)

              return () => log.push(`${name} destroy`)
            })

            return span()(name)
          }
          const scope = deferScope(() => {
            div()(
              if_($condition)(
                () => Block('then'),
                () => Block('else')
              )
            )
          })

          startScope(scope)

          log.length = 0
          // previous content cleanup must run before the new content setup
          $condition(false)

          expect(log).toEqual(['then destroy', 'else run'])

          stopScope(scope)
        })

        it('should destroy previous content before rendering the new one', () => {
          const log: string[] = []
          const $condition = signal(true)
          const Block = (name: string) => {
            log.push(`${name} render`)
            effect(() => {
              log.push(`${name} run`)

              return () => log.push(`${name} destroy`)
            })

            return span()(name)
          }
          const scope = deferScope(() => {
            div()(
              if_($condition)(
                () => Block('then'),
                () => Block('else')
              )
            )
          })

          startScope(scope)

          log.length = 0
          $condition(false)

          expect(log).toEqual([
            'then destroy',
            'else render',
            'else run'
          ])

          stopScope(scope)
        })

        it('should destroy content effects while their DOM is attached', () => {
          const $condition = signal(true)
          let connectedAtDestroy: boolean | undefined

          function Then() {
            const el = span()('then')

            effect(() => () => {
              connectedAtDestroy = el.isConnected
            })

            return el
          }

          render(() => div()(
            if_($condition)(
              () => Then(),
              () => span()('else')
            )
          ))

          $condition(false)

          expect(connectedAtDestroy).toBe(true)
        })

        it('should stop rows when the branch is hidden during rows start', () => {
          const log: string[] = []
          const $show = signal(true)
          const $items = signal([1, 2])
          const $tick = signal(0)
          let armed = false

          function Row($item: () => number) {
            const id = $item()

            effect(() => {
              log.push(`row ${id} run ${$tick()}`)

              if (id === 1 && armed) {
                batch(() => $show(false))
              }

              return () => log.push(`row ${id} destroy`)
            })

            return span()(String(id))
          }

          render(() => div()(
            if_($show)(
              () => span()(
                for_($items, item => item)(
                  $item => Row($item)
                )
              ),
              () => span()('hidden')
            )
          ))

          $items([])
          armed = true
          log.length = 0
          // the branch is torn down from inside the first row start:
          // the teardown is immediate - the running row is destroyed and
          // the remaining rows never start
          $items([1, 2])
          armed = false

          expect(log).toEqual([
            'row 1 run 0',
            'row 1 destroy'
          ])

          log.length = 0
          $tick(1)

          expect(log).toEqual([])
        })

        it('should reset rows on empty transition before mount', () => {
          const log: string[] = []
          const $items = signal([1, 2])

          function Row($item: () => number) {
            const initial = $item()

            effect(() => {
              log.push(`row ${initial} run`)

              return () => log.push(`row ${initial} destroy`)
            })

            return span()(String(initial))
          }

          let el!: HTMLElement
          const scope = deferScope(() => {
            el = div()(
              for_($items, item => item)(
                $item => Row($item)
              )
            )
          })

          // pre-mount transition to empty must discard the stale rows
          $items([])

          startScope(scope)

          expect(log).toEqual([])

          $items([1, 3])

          expect(log).toEqual(['row 1 run', 'row 3 run'])
          expect(el.textContent).toBe('13')

          stopScope(scope)
        })

        it('should stop rows when the loop is stopped before it is started', () => {
          const log: string[] = []
          const $items = signal([1, 2])
          const $cond = signal(true)

          function Row($item: () => number) {
            const initial = $item()

            return span()(
              if_($cond)(
                () => {
                  log.push(`row ${initial} then`)

                  return span()('T')
                },
                () => {
                  log.push(`row ${initial} else`)

                  return span()('F')
                }
              )
            )
          }

          const scope = deferScope(() => {
            div()(
              for_($items, item => item)(
                $item => Row($item)
              )
            )
          })

          log.length = 0
          stopScope(scope)

          // the nested condition swappers of the discarded rows must be gone
          $cond(false)

          expect(log).toEqual([])
        })

        it('should destroy removed rows before starting created rows', () => {
          const log: string[] = []
          const $items = signal([1, 2])

          function Row($item: () => number) {
            const initial = $item()

            effect(() => {
              log.push(`row ${initial} run`)

              return () => log.push(`row ${initial} destroy`)
            })

            return span()(String(initial))
          }

          const scope = deferScope(() => {
            div()(
              for_($items, item => item)(
                $item => Row($item)
              )
            )
          })

          startScope(scope)

          log.length = 0
          $items([1, 3])

          expect(log).toEqual([
            'row 2 destroy',
            'row 3 run'
          ])

          stopScope(scope)
        })

        it('should not leak loop context into effects flushed after reconcile', () => {
          const $items = signal([1])
          const $other = signal(0)
          const observed: unknown[] = []
          const stopOuter = effect(() => {
            $other()
            observed.push(getContext())
          })
          const scope = deferScope(() => {
            context([], () => {
              div()(
                for_($items, (item) => {
                  // signal write from the tracker queues the outer effect for the flush
                  $other($other() + 1)

                  return item
                })(
                  $item => span()(String($item()))
                )
              )
            })
          })

          startScope(scope)

          observed.length = 0
          $items([1, 2])

          // the outer effect must not observe the loop DI context
          expect(observed).toEqual([undefined])

          stopScope(scope)
          stopOuter()
        })

        it('should keep injection context in track function on list updates', () => {
          function Key() {
            return (item: number) => item
          }

          const $items = signal([1])
          const scope = deferScope(() => {
            context([], () => {
              div()(
                for_($items, item => inject(Key)(item))(
                  $item => span()(String($item()))
                )
              )
            })
          })

          startScope(scope)

          // the reconcile update path must observe the loop DI context
          $items([1, 2])

          stopScope(scope)
        })

        it('should not run replaced content effects on condition change before mount', () => {
          const log: string[] = []
          const $condition = signal(true)

          function Then() {
            effect(() => {
              log.push('then')
            })

            return span()('then')
          }

          function Else() {
            effect(() => {
              log.push('else')
            })

            return span()('else')
          }

          const scope = deferScope(() => {
            div()(
              if_($condition)(
                () => Then(),
                () => Else()
              )
            )
          })

          // swap before start: the replaced branch must never run or resurrect
          $condition(false)

          startScope(scope)

          expect(log).toEqual(['else'])

          stopScope(scope)
        })

        it('should destroy content effects on condition change', () => {
          const log: string[] = []
          const $condition = signal(true)
          const $dep = signal(0)

          function Child() {
            effect(() => {
              log.push(`child ${$dep()}`)

              return () => log.push('child destroy')
            })

            return span()('child')
          }

          render(() => div()(
            if_($condition)(
              () => Child()
            )
          ))

          expect(log).toEqual(['child 0'])

          log.length = 0
          $condition(false)

          expect(log).toEqual(['child destroy'])

          log.length = 0
          $dep(1)

          expect(log).toEqual([])
        })

        it('should destroy condition content effects before parent effects', () => {
          const log: string[] = []

          function Child() {
            effect(() => () => {
              log.push('child destroy')
            })

            return span()('child')
          }

          const scope = deferScope(() => {
            effect(() => () => {
              log.push('parent destroy')
            })
            div()(
              if_(signal(true))(
                () => Child()
              )
            )
          })

          startScope(scope)

          log.length = 0
          stopScope(scope)

          expect(log).toEqual(['child destroy', 'parent destroy'])
        })

        it('should destroy row effects in visual order after reorder', () => {
          const log: string[] = []
          const $items = signal([1, 2, 3])

          function Row($item: () => number) {
            const initial = $item()

            effect(() => () => {
              log.push(`row ${initial} destroy`)
            })

            return span()(String(initial))
          }

          const scope = deferScope(() => {
            div()(
              for_($items, item => item)(
                $item => Row($item)
              )
            )
          })

          startScope(scope)

          // reorder: visual order becomes 3, 1, 2
          $items([3, 1, 2])
          stopScope(scope)

          expect(log).toEqual([
            'row 3 destroy',
            'row 1 destroy',
            'row 2 destroy'
          ])
        })

        it('should destroy surviving row effects on unmount after reconcile', () => {
          const log: string[] = []
          const $items = signal([1, 2])

          function Row($item: () => number) {
            effect(() => {
              log.push(`row ${$item()}`)

              return () => log.push(`row ${$item()} destroy`)
            })

            return span()(String($item()))
          }

          const scope = deferScope(() => {
            div()(
              for_($items, item => item)(
                $item => Row($item)
              )
            )
          })

          startScope(scope)

          expect(log).toEqual(['row 1', 'row 2'])

          log.length = 0
          // reorder with both rows surviving the keyed reconcile
          $items([2, 1])

          expect(log).toEqual([])

          stopScope(scope)

          expect(log.sort()).toEqual(['row 1 destroy', 'row 2 destroy'])
        })

        it('should defer effects created within injection context', () => {
          const log: string[] = []

          function Child() {
            effect(() => {
              log.push('child')

              return () => log.push('child destroy')
            })

            return span()('child')
          }

          const scope = deferScope(() => {
            context([], () => div()(Child()))
          })

          expect(log).toEqual([])

          startScope(scope)

          expect(log).toEqual(['child'])

          log.length = 0
          stopScope(scope)

          expect(log).toEqual(['child destroy'])
        })

        it('should run nested condition content effects before all parent effects', () => {
          const log: string[] = []

          function Inner() {
            effect(() => {
              log.push('inner')
            })

            return span()('inner')
          }

          function Middle() {
            effect(() => {
              log.push('middle')
            })

            return div()(
              if_(signal(true))(
                () => Inner()
              )
            )
          }

          function Outer() {
            effect(() => {
              log.push('outer')
            })

            return div()(
              if_(signal(true))(
                () => Middle()
              )
            )
          }

          render(() => Outer())

          expect(log).toEqual([
            'inner',
            'middle',
            'outer'
          ])
        })
      })

      describe('tracking barriers', () => {
        it('should not subscribe an effect that dispatches an event to what the handler reads', () => {
          const $unrelated = signal(0)
          const effectRuns: number[] = []
          const handlerRuns: number[] = []
          let el!: HTMLButtonElement

          render(() => {
            el = button({
              onClick: () => {
                handlerRuns.push($unrelated())
              }
            })('click')

            effect(() => {
              effectRuns.push(effectRuns.length)
              el.click()
            })

            return el
          })

          expect(effectRuns).toHaveLength(1)
          expect(handlerRuns).toHaveLength(1)

          $unrelated(1)

          // the handler's read must not be a dependency of the dispatching effect
          expect(effectRuns).toHaveLength(1)
          expect(handlerRuns).toHaveLength(1)
        })
      })
    })
  })
})
