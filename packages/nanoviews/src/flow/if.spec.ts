import {
  describe,
  it,
  expect,
  expectTypeOf
} from 'vitest'
import { composeStories } from '@nanoviews/storybook'
import { render } from '@nanoviews/testing-library'
import {
  type WritableSignal,
  type ReadableSignal,
  signal,
  effect
} from 'kida'
import {
  b,
  i
} from '../elements/elements.js'
import * as Stories from './if.stories.js'
import { if_ } from './if.js'

const {
  StaticValue,
  ReactiveValue,
  ReactiveValueThenOnly
} = composeStories(Stories)

describe('nanoviews', () => {
  describe('flow', () => {
    describe('if', () => {
      it('should handle static value', () => {
        const { container } = render(StaticValue())

        expect(container.innerHTML).toBe('<div><b>True</b></div>')
      })

      it('should handle reactive value', () => {
        const value = signal(true)
        const { container } = render(ReactiveValue({
          value
        }))

        expect(container.innerHTML).toBe('<div><b>True: true</b></div>')

        value(false)

        expect(container.innerHTML).toBe('<div>False</div>')
      })

      it('should handle reactive value then only', () => {
        const value = signal(true)
        const { container } = render(ReactiveValueThenOnly({
          value
        }))

        expect(container.innerHTML).toBe('<div><b>True: true</b></div>')

        value(false)

        expect(container.innerHTML).toBe('<div></div>')
      })

      it('should render a write to the condition made by the branch it selected', () => {
        const $open = signal(false)
        const $allowed = signal(false)
        const $text = signal('closed')
        const { container } = render(() => if_($open)(
          () => {
            // the branch refuses to be shown, so the write reaches the
            // condition from an effect the swap itself started
            effect(() => {
              if (!$allowed()) {
                $open(false)
              }
            })

            return b()('open')
          },
          () => i()($text)
        ))

        $open(true)

        expect(container.innerHTML).toBe('<div><i>closed</i></div>')

        // the branch the write brought back is live, not merely rendered
        $text('shut')

        expect(container.innerHTML).toBe('<div><i>shut</i></div>')
      })

      it('should render a write to the condition made while the branch renders', () => {
        const $open = signal(false)
        const $tick = signal(0)
        const runs: number[] = []
        const { container } = render(() => if_($open)(
          () => {
            $open(false)

            return b()('open')
          },
          () => {
            // an effect of the branch the write brought back: unlike a
            // binding it runs only if that branch was started
            effect(() => {
              runs.push($tick())
            })

            return i()('closed')
          }
        ))

        $open(true)

        expect(container.innerHTML).toBe('<div><i>closed</i></div>')
        expect(runs).toEqual([0, 0])

        $tick(1)

        expect(runs).toEqual([0, 0, 1])
      })

      it('should start the branch brought up by a write made on mount', () => {
        const $open = signal(true)
        const $allowed = signal(false)
        const $tick = signal(0)
        const runs: number[] = []
        const { container } = render(() => if_($open)(
          () => {
            effect(() => {
              if (!$allowed()) {
                $open(false)
              }
            })

            return b()('open')
          },
          () => {
            // an effect of the branch the mount-time write brought up:
            // unlike a binding it runs only if that branch was started
            effect(() => {
              runs.push($tick())
            })

            return i()('closed')
          }
        ))

        expect(container.innerHTML).toBe('<div><i>closed</i></div>')
        expect(runs).toEqual([0])

        $tick(1)

        expect(runs).toEqual([0, 1])
      })

      it('should keep signal type in branches', () => {
        const $value = signal<string | null>('truthy')

        if_($value)(
          ($truthy) => {
            expectTypeOf($truthy).toExtend<WritableSignal<string | null>>()
            return null
          },
          ($falsy) => {
            expectTypeOf($falsy).toExtend<WritableSignal<string | null>>()
            return null
          }
        )
      })

      it('should narrow value type of union signal in branches', () => {
        const $value = signal<string | null>('truthy')

        if_($value)(
          ($truthy) => {
            expectTypeOf($truthy()).toEqualTypeOf<string>()
            expectTypeOf($truthy).toExtend<ReadableSignal<string>>()
            return null
          },
          ($falsy) => {
            expectTypeOf($falsy()).toEqualTypeOf<null>()
            return null
          }
        )
      })

      it('should narrow boolean signal value to literals in branches', () => {
        const $value = signal(true)

        if_($value)(
          ($truthy) => {
            expectTypeOf($truthy()).toEqualTypeOf<true>()
            return null
          },
          ($falsy) => {
            expectTypeOf($falsy()).toEqualTypeOf<false>()
            return null
          }
        )
      })

      it('should narrow static union value in branches', () => {
        const value = 'truthy' as string | null

        if_(value)(
          (truthy) => {
            expectTypeOf(truthy).toEqualTypeOf<string>()
            return null
          },
          (falsy) => {
            expectTypeOf(falsy).toEqualTypeOf<null>()
            return null
          }
        )
      })
    })
  })
})
