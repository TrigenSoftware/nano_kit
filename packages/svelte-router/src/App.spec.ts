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
import { tick } from 'svelte'
import { provide } from '@nano_kit/store'
import {
  type Routes,
  LocationNavigation$,
  Page$,
  page,
  virtualNavigation
} from '@nano_kit/router'
import { router } from './core.js'
import AppFixture from '../test/AppFixture.svelte'
import HomePage from '../test/pages/HomePage.svelte'
import AboutPage from '../test/pages/AboutPage.svelte'

const routes = {
  home: '/home',
  about: '/about'
} as const

function getHtml(container: HTMLElement) {
  return container.innerHTML.replaceAll('<!---->', '')
}

afterEach(cleanup)

describe('svelte-router', () => {
  describe('App', () => {
    it('should render the page matched from the injection context', () => {
      const locationNavigation = virtualNavigation<Routes>('/home', routes)
      const { container } = render(AppFixture, {
        props: {
          context: [
            provide(LocationNavigation$, locationNavigation),
            provide(Page$, router(locationNavigation[0], [
              page('home', HomePage),
              page('about', AboutPage)
            ]))
          ]
        }
      })

      expect(getHtml(container)).toBe('<div>Home Page</div>')
    })

    it('should switch the page when the location changes', async () => {
      const locationNavigation = virtualNavigation<Routes>('/home', routes)
      const [, navigation] = locationNavigation
      const { container } = render(AppFixture, {
        props: {
          context: [
            provide(LocationNavigation$, locationNavigation),
            provide(Page$, router(locationNavigation[0], [
              page('home', HomePage),
              page('about', AboutPage)
            ]))
          ]
        }
      })

      navigation.push('/about')
      await tick()

      expect(getHtml(container)).toBe('<div>About Page</div>')

      navigation.push('/unknown')
      await tick()

      expect(getHtml(container)).toBe('')

      navigation.push('/home')
      await tick()

      expect(getHtml(container)).toBe('<div>Home Page</div>')
    })
  })
})
