import {
  describe,
  it,
  expect,
  vi
} from 'vitest'
import { composeStories } from '@nanoviews/storybook'
import { render } from '@nanoviews/testing-library'
import {
  signal,
  batch
} from 'kida'
import { b } from '../elements/elements.js'
import { default_ } from './switch.js'
import * as Stories from './match.stories.js'
import {
  when_,
  match_
} from './match.js'

const {
  StaticValue,
  ReactiveValue,
  ReactiveValueWithoutDefault,
  CaseValue
} = composeStories(Stories)

describe('nanoviews', () => {
  describe('flow', () => {
    describe('match', () => {
      it('should handle static value', () => {
        const { container } = render(StaticValue())

        expect(container.innerHTML).toBe('<div><b>Ready</b></div>')
      })

      it('should handle reactive value', () => {
        const loading = signal(true)
        const error = signal(false)
        const { container } = render(ReactiveValue({
          loading,
          error
        }))

        expect(container.innerHTML).toBe('<div><i>Loading</i></div>')

        loading(false)

        expect(container.innerHTML).toBe('<div>Ready</div>')

        error(true)

        expect(container.innerHTML).toBe('<div><b>Error</b></div>')
      })

      it('should render nothing when no case holds and there is no default', () => {
        const loading = signal(true)
        const error = signal(false)
        const { container } = render(ReactiveValueWithoutDefault({
          loading,
          error
        }))

        expect(container.innerHTML).toBe('<div><i>Loading</i></div>')

        loading(false)

        expect(container.innerHTML).toBe('<div></div>')
      })

      it('should hand the case its own value, still a signal', () => {
        const post = signal<{ title: string } | null>(null)
        const { container } = render(CaseValue({
          post
        }))

        expect(container.innerHTML).toBe('<div>No post</div>')

        post({
          title: 'one'
        })

        expect(container.innerHTML).toBe('<div><b>one</b></div>')

        // The branch took the signal, not the value: a change to the post
        // updates the text and leaves the branch where it is
        const node = container.querySelector('b')

        post({
          title: 'two'
        })

        expect(container.innerHTML).toBe('<div><b>two</b></div>')
        expect(container.querySelector('b')).toBe(node)
      })

      it('should not read a case below the one that holds', () => {
        const loading = signal(true)
        const error = vi.fn(() => false)
        const { container } = render(ReactiveValue({
          loading,
          error
        }))

        expect(container.innerHTML).toBe('<div><i>Loading</i></div>')
        expect(error).not.toHaveBeenCalled()

        loading(false)

        expect(error).toHaveBeenCalled()
      })

      it('should walk the cases once when they move together in a batch', () => {
        const loading = signal(true)
        const failed = signal(false)
        // The case is read once per walk, so the calls count the walks
        const error = vi.fn(() => failed())
        const { container } = render(ReactiveValue({
          loading,
          error
        }))

        expect(container.innerHTML).toBe('<div><i>Loading</i></div>')

        batch(() => {
          loading(false)
          failed(true)
        })

        expect(container.innerHTML).toBe('<div><b>Error</b></div>')
        expect(error).toHaveBeenCalledOnce()
      })

      it('should walk the cases twice when they move one after another', () => {
        const loading = signal(true)
        const failed = signal(false)
        const error = vi.fn(() => failed())
        const { container } = render(ReactiveValue({
          loading,
          error
        }))

        loading(false)

        // Without a batch the block settles on the default in between, and
        // that frame is what a `batch` around the pair hides
        expect(container.innerHTML).toBe('<div>Ready</div>')

        failed(true)

        expect(container.innerHTML).toBe('<div><b>Error</b></div>')
        expect(error).toHaveBeenCalledTimes(2)
      })

      it('should answer with the first default_ when there is more than one', () => {
        const { container } = render(() => match_(
          when_(false, () => b()('no')),
          default_(() => 'first'),
          default_(() => 'second')
        ))

        expect(container.innerHTML).toBe('<div>first</div>')
      })
    })
  })
})
