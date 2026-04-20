import {
  describe,
  it,
  expect,
  vi
} from 'vitest'
import { render } from '@testing-library/preact'
import { InjectionContextProvider } from '@nano_kit/preact'
import { provide } from '@nano_kit/store'
import {
  type Routes,
  buildPaths,
  Location$,
  Navigation$,
  virtualNavigation
} from '@nano_kit/router'
import {
  ariaCurrent,
  useLinkComponentAriaCurrent
} from './aria-current.js'
import {
  Link,
  linkComponent
} from './link.js'

const routes = {
  home: '/',
  about: '/about'
} as const

describe('preact-router', () => {
  describe('aria-current', () => {
    it('should set aria-current when href matches current location', () => {
      const [$location, navigation] = virtualNavigation('/about', routes)
      const Link = linkComponent(
        navigation,
        buildPaths(routes),
        [ariaCurrent($location)]
      )
      const { container, unmount } = render(
        <Link href='/about'>
          About
        </Link>
      )
      const link = container.querySelector('a')!

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
      const { container, unmount } = render(
        <Link href='/about'>
          About
        </Link>
      )
      const link = container.querySelector('a')!

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
      const { container, unmount } = render(
        <Link href='/about'>
          About
        </Link>
      )
      const link = container.querySelector('a')!

      expect(isAriaCurrent).toHaveBeenCalledTimes(1)
      expect(link.getAttribute('aria-current')).toBeNull()

      unmount()
    })

    it('should enable aria-current for Link component', () => {
      const [$location, navigation] = virtualNavigation<Routes>('/about', routes)

      function TestApp() {
        useLinkComponentAriaCurrent()

        return (
          <Link href='/about'>
            About
          </Link>
        )
      }

      const { container, unmount } = render(
        <InjectionContextProvider
          context={[
            provide(Location$, $location),
            provide(Navigation$, navigation)
          ]}
        >
          <TestApp/>
        </InjectionContextProvider>
      )
      const link = container.querySelector('a')!

      expect(link.getAttribute('aria-current')).toBe('page')

      unmount()
    })
  })
})
