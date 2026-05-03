import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from 'vitest'
import {
  cleanup,
  render
} from '@testing-library/svelte'
import { tick } from 'svelte'
import { provide } from '@nano_kit/store'
import {
  type Routes,
  buildPaths,
  Location$,
  Navigation$,
  virtualNavigation
} from '@nano_kit/router'
import { ariaCurrent } from './aria-current.js'
import { linkComponent } from './link.js'
import AriaCurrentLinkFixture from '../test/AriaCurrentLinkFixture.svelte'
import AriaCurrentContextFixture from '../test/AriaCurrentContextFixture.svelte'

const routes = {
  home: '/',
  about: '/about'
} as const

afterEach(cleanup)

describe('svelte-router', () => {
  describe('aria-current', () => {
    it('should set aria-current when href matches current location', () => {
      const [$location, navigation] = virtualNavigation('/about', routes)
      const Link = linkComponent(
        navigation,
        buildPaths(routes),
        [ariaCurrent($location)]
      )
      const { container, unmount } = render(AriaCurrentLinkFixture, {
        props: {
          Link
        }
      })
      const [, link] = container.querySelectorAll('a')

      expect(link.getAttribute('aria-current')).toBe('page')

      unmount()
    })

    it('should not set aria-current when href does not match current location', () => {
      const [$location, navigation] = virtualNavigation('/', routes)
      const Link = linkComponent(
        navigation,
        buildPaths(routes),
        [ariaCurrent($location)]
      )
      const { container, unmount } = render(AriaCurrentLinkFixture, {
        props: {
          Link
        }
      })
      const [, link] = container.querySelectorAll('a')

      expect(link.getAttribute('aria-current')).toBeNull()

      unmount()
    })

    it('should use custom isAriaCurrent predicate', () => {
      const [$location, navigation] = virtualNavigation('/about', routes)
      const isAriaCurrent = vi.fn(() => false)
      const Link = linkComponent(
        navigation,
        buildPaths(routes),
        [ariaCurrent($location, isAriaCurrent)]
      )
      const { container, unmount } = render(AriaCurrentLinkFixture, {
        props: {
          Link
        }
      })
      const [, link] = container.querySelectorAll('a')

      expect(isAriaCurrent).toHaveBeenCalledTimes(2)
      expect(link.getAttribute('aria-current')).toBeNull()

      unmount()
    })

    it('should update aria-current when location changes', async () => {
      const [$location, navigation] = virtualNavigation('/', routes)
      const Link = linkComponent(
        navigation,
        buildPaths(routes),
        [ariaCurrent($location)]
      )
      const { container, unmount } = render(AriaCurrentLinkFixture, {
        props: {
          Link
        }
      })
      const [homeLink, aboutLink] = container.querySelectorAll('a')

      expect(homeLink.getAttribute('aria-current')).toBe('page')
      expect(aboutLink.getAttribute('aria-current')).toBeNull()

      navigation.push('/about')
      await tick()

      expect(homeLink.getAttribute('aria-current')).toBeNull()
      expect(aboutLink.getAttribute('aria-current')).toBe('page')

      navigation.push('/')
      await tick()

      expect(homeLink.getAttribute('aria-current')).toBe('page')
      expect(aboutLink.getAttribute('aria-current')).toBeNull()

      unmount()
    })

    it('should enable aria-current for Link component', () => {
      const [$location, navigation] = virtualNavigation<Routes>('/about', routes)
      const { container, unmount } = render(AriaCurrentContextFixture, {
        props: {
          context: [
            provide(Location$, $location),
            provide(Navigation$, navigation)
          ]
        }
      })
      const [, link] = container.querySelectorAll('a')

      expect(link.getAttribute('aria-current')).toBe('page')

      unmount()
    })

    it('should update aria-current for Link component when location changes', async () => {
      const [$location, navigation] = virtualNavigation<Routes>('/', routes)
      const { container, unmount } = render(AriaCurrentContextFixture, {
        props: {
          context: [
            provide(Location$, $location),
            provide(Navigation$, navigation)
          ]
        }
      })
      const [homeLink, aboutLink] = container.querySelectorAll('a')

      expect(homeLink.getAttribute('aria-current')).toBe('page')
      expect(aboutLink.getAttribute('aria-current')).toBeNull()

      navigation.push('/about')
      await tick()

      expect(homeLink.getAttribute('aria-current')).toBeNull()
      expect(aboutLink.getAttribute('aria-current')).toBe('page')

      navigation.push('/')
      await tick()

      expect(homeLink.getAttribute('aria-current')).toBe('page')
      expect(aboutLink.getAttribute('aria-current')).toBeNull()

      unmount()
    })
  })
})
