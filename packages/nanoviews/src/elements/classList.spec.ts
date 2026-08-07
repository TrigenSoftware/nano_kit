import {
  describe,
  it,
  expect
} from 'vitest'
import { composeStories } from '@nanoviews/storybook'
import { render } from '@nanoviews/testing-library'
import { signal } from 'kida'
import * as Stories from './classList.stories.js'

const {
  StaticValue,
  ReactiveValue
} = composeStories(Stories)

describe('nanoviews', () => {
  describe('elements', () => {
    describe('classList$', () => {
      it('should render static class list', () => {
        const { container } = render(StaticValue())

        expect(container.innerHTML).toBe('<div><div class="class1 class3">Hello, world!</div></div>')
      })

      it('should render reactive class list', () => {
        const primary = signal(true)
        const rounded = signal(false)
        const { container } = render(ReactiveValue({
          primary,
          rounded
        }))

        expect(container.innerHTML).toBe('<div><button class="button primary">Hello, world!</button></div>')

        primary(false)

        expect(container.innerHTML).toBe('<div><button class="button regular">Hello, world!</button></div>')

        rounded(true)

        expect(container.innerHTML).toBe('<div><button class="button regular rounded">Hello, world!</button></div>')

        primary(true)

        expect(container.innerHTML).toBe('<div><button class="button primary rounded">Hello, world!</button></div>')
      })

      it('should render partially reactive class list', () => {
        const primary = signal(true)
        const { container } = render(ReactiveValue({
          primary,
          rounded: true
        }))

        expect(container.innerHTML).toBe('<div><button class="button primary rounded">Hello, world!</button></div>')

        primary(false)

        expect(container.innerHTML).toBe('<div><button class="button regular rounded">Hello, world!</button></div>')

        primary(true)

        expect(container.innerHTML).toBe('<div><button class="button primary rounded">Hello, world!</button></div>')
      })
    })
  })
})
