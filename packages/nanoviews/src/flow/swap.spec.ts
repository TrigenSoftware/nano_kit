import {
  describe,
  it,
  expect,
  vi
} from 'vitest'
import { composeStories } from '@nanoviews/storybook'
import { render } from '@nanoviews/testing-library'
import { signal } from 'kida'
import { b } from '../elements/elements.js'
import * as Stories from './swap.stories.js'
import { swap_ } from './swap.js'

const {
  StaticValue,
  ReactiveValue
} = composeStories(Stories)

describe('nanoviews', () => {
  describe('flow', () => {
    describe('swap', () => {
      it('should render a static value', () => {
        const { container } = render(StaticValue())

        expect(container.innerHTML).toBe('<div><b>static</b></div>')
      })

      it('should call the render once for a static value without subscribing', () => {
        const render_ = vi.fn((value: string) => b()(value))
        const { container } = render(() => swap_('static', render_))

        expect(container.innerHTML).toBe('<div><b>static</b></div>')
        expect(render_).toHaveBeenCalledTimes(1)
      })

      it('should build the child anew on every change', () => {
        const tab = signal('list')
        const { container } = render(ReactiveValue({
          tab
        }))
        const [first] = container.getElementsByTagName('b')

        expect(container.innerHTML).toBe('<div><b>list</b></div>')

        tab('grid')

        expect(container.innerHTML).toBe('<div><i>grid</i></div>')

        // the child is rebuilt, not updated: the node the first value made
        // is gone rather than reused
        tab('list')

        expect(container.innerHTML).toBe('<div><b>list</b></div>')
        expect(container.getElementsByTagName('b')[0]).not.toBe(first)
      })
    })
  })
})
