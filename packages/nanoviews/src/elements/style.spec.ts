import {
  describe,
  it,
  expect
} from 'vitest'
import { composeStories } from '@nanoviews/storybook'
import { render } from '@nanoviews/testing-library'
import { signal } from 'kida'
import * as Stories from './style.stories.js'

const {
  StaticValue,
  ReactiveValue
} = composeStories(Stories)

describe('nanoviews', () => {
  describe('elements', () => {
    describe('style$', () => {
      it('should render static value', () => {
        const { container } = render(StaticValue())

        expect(container.innerHTML).toBe('<div><div style="color: green;">Hello, world!</div></div>')
      })

      it('should render reactive value', () => {
        const color = signal('green')
        const { container } = render(ReactiveValue({
          color
        }))

        expect(container.innerHTML).toBe('<div><div style="color: green;">Hello, world!</div></div>')

        color('red')

        expect(container.innerHTML).toBe('<div><div style="color: red;">Hello, world!</div></div>')
      })
    })
  })
})
