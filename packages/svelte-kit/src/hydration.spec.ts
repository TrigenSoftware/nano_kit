import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest'
import {
  cleanup,
  render
} from '@testing-library/svelte'
import HydrationFixture from '../test/HydrationFixture.svelte'
import RehydrationFixture from '../test/RehydrationFixture.svelte'
import EmptyHydrationFixture from '../test/EmptyHydrationFixture.svelte'

function getHtml(container: HTMLElement) {
  return container.innerHTML.replaceAll('<!---->', '')
}

afterEach(cleanup)

describe('svelte-kit', () => {
  describe('hydration', () => {
    it('should hydrate on mount', () => {
      const { container } = render(HydrationFixture)

      expect(getHtml(container)).toBe('<div>hello</div>')
    })

    it('should re-hydrate when hydration context is set again', () => {
      const { container } = render(RehydrationFixture)

      expect(getHtml(container)).toBe('<div>second</div>')
    })

    it('should skip hydration when dehydrated is falsy', () => {
      const { container } = render(EmptyHydrationFixture)

      expect(getHtml(container)).toBe('<div>empty</div>')
    })
  })
})
