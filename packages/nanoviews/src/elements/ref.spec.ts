import {
  describe,
  it,
  expect,
  expectTypeOf
} from 'vitest'
import { render } from '@nanoviews/testing-library'
import { signal } from 'kida'
import {
  button,
  input
} from './elements.js'
import { ref$ } from './ref.js'

describe('nanoviews', () => {
  describe('elements', () => {
    describe('ref$', () => {
      it('should set ref', () => {
        const ref = signal<Element | null>(null)

        render(() => button({
          [ref$]: ref
        })('Click me!'))

        expect(ref()).toBeInstanceOf(HTMLButtonElement)
      })

      it('should take a signal of the element it sits on', () => {
        const ref = signal<HTMLButtonElement | null>(null)

        render(() => button({
          [ref$]: ref
        })('Click me!'))

        // the point of the precise type: no cast to reach the element's own
        // surface
        expectTypeOf(ref()).toEqualTypeOf<HTMLButtonElement | null>()
        expect(ref()!.type).toBe('submit')
      })

      it('should reject a signal of a different element', () => {
        const ref = signal<HTMLInputElement | null>(null)

        button({
          // @ts-expect-error the button is not an input
          [ref$]: ref
        })('Click me!')

        input({
          [ref$]: ref
        })
      })
    })
  })
})
