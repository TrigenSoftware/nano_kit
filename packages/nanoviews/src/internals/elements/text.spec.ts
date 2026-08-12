import {
  describe,
  it,
  expect
} from 'vitest'
import { composeStories } from '@nanoviews/storybook'
import { render } from '@nanoviews/testing-library'
import { signal } from 'kida'
import type { Primitive } from '../types/index.js'
import * as Stories from './text.stories.js'

const {
  StaticValue,
  ReactiveValue
} = composeStories(Stories)

describe('nanoviews', () => {
  describe('internals', () => {
    describe('elements', () => {
      describe('text', () => {
        it('should render static value', () => {
          const { container } = render(StaticValue())

          expect(container.textContent).toBe('Hello, world!')
        })

        it('should render reactive value', () => {
          const value = signal<Primitive>('Hello, world!')
          const { container } = render(ReactiveValue({
            value
          }))

          expect(container.textContent).toBe('Hello, world!')

          value('Hello, nanoviews!')

          expect(container.textContent).toBe('Hello, nanoviews!')
        })

        it('should render empty value as empty string, but keep falsy ones', () => {
          const value = signal<Primitive>(null)
          const { container } = render(ReactiveValue({
            value
          }))

          expect(container.textContent).toBe('')

          value(undefined)

          expect(container.textContent).toBe('')

          value(0)

          expect(container.textContent).toBe('0')

          value(false)

          expect(container.textContent).toBe('false')

          value('')

          expect(container.textContent).toBe('')
        })
      })
    })
  })
})
