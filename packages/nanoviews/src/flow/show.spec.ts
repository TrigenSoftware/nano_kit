import {
  describe,
  it,
  expect,
  vi
} from 'vitest'
import { composeStories } from '@nanoviews/storybook'
import {
  render,
  fireEvent
} from '@nanoviews/testing-library'
import { signal } from 'kida'
import { b } from '../elements/elements.js'
import * as Stories from './show.stories.js'
import { show_ } from './show.js'

const {
  StaticValue,
  ReactiveValue,
  KeptAlive,
  Counter
} = composeStories(Stories)

describe('nanoviews', () => {
  describe('flow', () => {
    describe('show', () => {
      it('should render a static value', () => {
        const { container } = render(StaticValue())

        expect(container.innerHTML).toBe('<div><b>shown</b></div>')
      })

      it('should render nothing for a static falsy value without calling render', () => {
        const render_ = vi.fn(() => b()('never'))

        expect(show_(false, render_)).toBe(null)
        expect(render_).not.toHaveBeenCalled()
      })

      it('should show and hide the child', () => {
        const visible = signal(false)
        const { container } = render(ReactiveValue({
          visible
        }))

        expect(container.innerHTML).toBe('<div></div>')

        visible(true)

        expect(container.innerHTML).toBe('<div><b>content</b></div>')

        visible(false)

        expect(container.innerHTML).toBe('<div></div>')
      })

      it('should keep the tree alive and up to date across the toggles', () => {
        const visible = signal(true)
        const text = signal('a')
        const { container } = render(KeptAlive({
          visible,
          text
        }))
        const [node] = container.getElementsByTagName('b')

        expect(container.innerHTML).toBe('<div><b>a</b></div>')

        visible(false)
        text('b')
        visible(true)

        // the tree is parked, not destroyed: the same node comes back, and
        // the binding kept it fresh while it was hidden
        expect(container.innerHTML).toBe('<div><b>b</b></div>')
        expect(container.getElementsByTagName('b')[0]).toBe(node)
      })

      it('should keep the counter state and the click alive across the toggles', () => {
        const visible = signal(true)
        const { container } = render(Counter({
          visible
        }))
        const [counter] = container.getElementsByTagName('button')

        fireEvent.click(counter)

        expect(container.innerHTML).toBe('<div><button>Count: 1</button></div>')

        visible(false)

        expect(container.innerHTML).toBe('<div></div>')

        visible(true)

        expect(container.getElementsByTagName('button')[0]).toBe(counter)
        expect(container.innerHTML).toBe('<div><button>Count: 1</button></div>')

        fireEvent.click(counter)

        expect(container.innerHTML).toBe('<div><button>Count: 2</button></div>')
      })
    })
  })
})
