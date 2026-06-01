import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from 'vitest'
import {
  cleanup,
  fireEvent,
  render
} from '@testing-library/svelte'
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
import { linkComponent } from './link.js'
import { preloadable } from './preloadable.js'
import PreloadableLinkFixture from '../test/PreloadableLinkFixture.svelte'
import PreloadableContextFixture from '../test/PreloadableContextFixture.svelte'
import AboutPage from '../test/pages/AboutPage.svelte'

const routes = {
  home: '/',
  about: '/about'
} as const
const about = Promise.resolve({
  default: AboutPage
})

afterEach(cleanup)

describe('svelte-router', () => {
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
      const onfocus = vi.fn()
      const onmouseenter = vi.fn()
      const { container, unmount } = render(PreloadableLinkFixture, {
        props: {
          Link,
          preload: true,
          onfocus,
          onmouseenter
        }
      })
      const link = container.querySelector('a')!

      await fireEvent.focus(link)
      await fireEvent.mouseEnter(link)
      await about

      expect(onfocus).toHaveBeenCalledTimes(1)
      expect(onmouseenter).toHaveBeenCalledTimes(1)
      expect(aboutLoader).toHaveBeenCalledTimes(1)

      unmount()
    })

    it('should not preload page when preload is disabled by default', async () => {
      const aboutLoader = vi.fn(() => about)
      const pages = [
        page('about', loadable(aboutLoader))
      ]
      const Link = linkComponent(
        virtualNavigation('/', routes)[1],
        buildPaths(routes),
        [preloadable(pages)]
      )
      const { container, unmount } = render(PreloadableLinkFixture, {
        props: {
          Link
        }
      })
      const link = container.querySelector('a')!

      await fireEvent.focus(link)
      await fireEvent.mouseEnter(link)

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
      const { container, unmount } = render(PreloadableLinkFixture, {
        props: {
          Link
        }
      })
      const link = container.querySelector('a')!

      await fireEvent.mouseEnter(link)
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
      const { container, unmount } = render(PreloadableContextFixture, {
        props: {
          injector: [
            provide(Navigation$, navigation),
            provide(Pages$, pages)
          ],
          preloadByDefault: true
        }
      })
      const link = container.querySelector('a')!

      await fireEvent.mouseEnter(link)
      await about

      expect(aboutLoader).toHaveBeenCalledTimes(1)

      unmount()
    })
  })
})
