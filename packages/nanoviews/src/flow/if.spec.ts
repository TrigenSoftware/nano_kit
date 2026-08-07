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
  signal
} from 'kida'
import * as Stories from './if.stories.js'
import { if_ } from './if.js'

const {
  StaticValue,
  ReactiveValue,
  ReactiveValueThenOnly
} = composeStories(Stories)

describe('nanoviews', () => {
  describe('logic', () => {
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
