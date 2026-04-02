import {
  describe,
  it,
  expect,
  vi
} from 'vitest'
import {
  render,
  act,
  fireEvent
} from '@testing-library/react'
import { InjectionContextProvider } from '@nano_kit/react'
import { provide } from '@nano_kit/store'
import {
  type Routes,
  buildPaths,
  loadable,
  page,
  Navigation$,
  Pages$,
  virtualNavigation
} from '@nano_kit/router'
import {
  Link,
  linkComponent
} from './link.js'
import {
  preloadable,
  useLinkComponentPreload
} from './preloadable.js'

function AboutPage() {
  return <div>About Page</div>
}

const routes = {
  home: '/',
  about: '/about'
} as const
const about = Promise.resolve({
  default: AboutPage
})

describe('react-router', () => {
  describe('preloadable', () => {
    it('should preload page on focus or mouse enter when preload is enabled', async () => {
      const aboutLoader = vi.fn(() => about)
      const pages = [
        page('about', loadable(aboutLoader))
      ]
      const Link = linkComponent(
        virtualNavigation('/', routes)[1],
        buildPaths(routes),
        [preloadable(pages)]
      )
      const onFocus = vi.fn()
      const onMouseEnter = vi.fn()
      const { container, unmount } = render(
        <Link
          to='about'
          preload
          onFocus={onFocus}
          onMouseEnter={onMouseEnter}
        >
          About
        </Link>
      )
      const link = container.querySelector('a')!

      act(() => {
        fireEvent.focus(link)
        fireEvent.mouseEnter(link)
      })

      await about

      expect(onFocus).toHaveBeenCalledTimes(1)
      expect(onMouseEnter).toHaveBeenCalledTimes(1)
      expect(aboutLoader).toHaveBeenCalledTimes(1)

      unmount()
    })

    it('should not preload page when preload is disabled by default', () => {
      const aboutLoader = vi.fn(() => about)
      const pages = [
        page('about', loadable(aboutLoader))
      ]
      const Link = linkComponent(
        virtualNavigation('/', routes)[1],
        buildPaths(routes),
        [preloadable(pages)]
      )
      const { container, unmount } = render(
        <Link to='about'>
          About
        </Link>
      )
      const link = container.querySelector('a')!

      act(() => {
        fireEvent.focus(link)
        fireEvent.mouseEnter(link)
      })

      expect(aboutLoader).not.toHaveBeenCalled()

      unmount()
    })

    it('should preload page by default when enabled in preloadable settings', async () => {
      const aboutLoader = vi.fn(() => about)
      const pages = [
        page('about', loadable(aboutLoader))
      ]
      const Link = linkComponent(
        virtualNavigation('/', routes)[1],
        buildPaths(routes),
        [preloadable(pages, true)]
      )
      const { container, unmount } = render(
        <Link to='about'>
          About
        </Link>
      )
      const link = container.querySelector('a')!

      act(() => {
        fireEvent.mouseEnter(link)
      })

      await about

      expect(aboutLoader).toHaveBeenCalledTimes(1)

      unmount()
    })

    it('should enable preload by default for Link component', async () => {
      const aboutLoader = vi.fn(() => about)
      const pages = [
        page('about', loadable(aboutLoader))
      ]
      const navigation = virtualNavigation<Routes>('/', routes)[1]

      function TestApp() {
        useLinkComponentPreload(true)

        return (
          <Link to='about'>
            About
          </Link>
        )
      }

      const { container, unmount } = render(
        <InjectionContextProvider
          context={[
            provide(Navigation$, navigation),
            provide(Pages$, pages)
          ]}
        >
          <TestApp/>
        </InjectionContextProvider>
      )
      const link = container.querySelector('a')!

      act(() => {
        fireEvent.mouseEnter(link)
      })

      await about

      expect(aboutLoader).toHaveBeenCalledTimes(1)

      unmount()
    })
  })
})
