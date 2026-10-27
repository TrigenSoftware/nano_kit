import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach
} from 'vitest'
import { signal } from '@nano_kit/store'
import { virtualNavigation } from './navigation.js'
import {
  page,
  layout,
  loadable,
  router
} from './router.js'
import { title } from './head.js'
import { titleAnnouncer } from './announcer.js'

const routes = {
  home: '/home',
  about: '/about',
  contact: '/contact',
  inbox: '/inbox'
}

function getRegion() {
  return document.querySelector('body > nano-kit-title-announcer')?.shadowRoot?.querySelector('[role="status"]')
}

describe('router', () => {
  describe('titleAnnouncer', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should add a live region to the body and remove it when stopped', () => {
      const [$location] = virtualNavigation('/home', routes)
      const $page = router($location, [])
      const stop = titleAnnouncer($page)

      expect(getRegion()).not.toBeNull()

      stop()

      expect(getRegion()).toBeUndefined()
    })

    it('should keep the live region out of the queries of the page', () => {
      const [$location] = virtualNavigation('/home', routes)
      const $page = router($location, [])
      const stop = titleAnnouncer($page)

      expect(getRegion()).not.toBeNull()
      expect(document.querySelector('[role="status"]')).toBeNull()

      stop()
    })

    it('should not announce the title the document opened with', () => {
      const [$location] = virtualNavigation('/home', routes)
      const $page = router($location, [
        page('home', {
          default: 'Home',
          Head$: () => [title('Home')]
        })
      ])
      const stop = titleAnnouncer($page)

      vi.advanceTimersByTime(100)

      expect(getRegion()?.textContent).toBe('')

      stop()
    })

    it('should announce the title of the page navigation arrives at', () => {
      const [$location, navigation] = virtualNavigation('/home', routes)
      const $page = router($location, [
        page('home', 'Home'),
        page('about', {
          default: 'About',
          Head$: () => [title('About')]
        })
      ])
      const stop = titleAnnouncer($page)

      navigation.push('/about')
      vi.advanceTimersByTime(100)

      expect(getRegion()?.textContent).toBe('About')

      stop()
    })

    it('should announce a new title of the same page', () => {
      const [$location, navigation] = virtualNavigation('/home', routes)
      const $count = signal(1)
      const $page = router($location, [
        page('home', 'Home'),
        page('inbox', {
          default: 'Inbox',
          Head$: () => [title(() => `Inbox (${$count()})`)]
        })
      ])
      const stop = titleAnnouncer($page)

      navigation.push('/inbox')
      vi.advanceTimersByTime(100)
      $count(2)
      vi.advanceTimersByTime(100)

      expect(getRegion()?.textContent).toBe('Inbox (2)')

      stop()
    })

    it('should announce the title that has held for the delay', () => {
      const [$location, navigation] = virtualNavigation('/home', routes)
      const $name = signal<string | undefined>(undefined)
      const $page = router($location, [
        page('home', 'Home'),
        page('about', {
          default: 'About',
          Head$: () => [title(() => $name() || 'About')]
        })
      ])
      const stop = titleAnnouncer($page)

      navigation.push('/about')
      vi.advanceTimersByTime(50)
      $name('Ada')
      vi.advanceTimersByTime(50)

      expect(getRegion()?.textContent).toBe('')

      vi.advanceTimersByTime(50)

      expect(getRegion()?.textContent).toBe('Ada')

      stop()
    })

    it('should not announce a page with the same title', () => {
      const [$location, navigation] = virtualNavigation('/about', routes)
      const $page = router($location, [
        page('about', {
          default: 'About',
          Head$: () => [title('Plant1t')]
        }),
        page('contact', {
          default: 'Contact',
          Head$: () => [title('Plant1t')]
        })
      ])
      const stop = titleAnnouncer($page)

      navigation.push('/contact')
      vi.advanceTimersByTime(100)

      expect(getRegion()?.textContent).toBe('')

      stop()
    })

    it('should announce the first heading of a page without a title', () => {
      const [$location, navigation] = virtualNavigation('/home', routes)
      const $page = router($location, [
        page('home', {
          default: 'Home',
          Head$: () => [title('Home')]
        }),
        page('inbox', 'Inbox')
      ])
      const heading = document.createElement('h1')
      const stop = titleAnnouncer($page)

      navigation.push('/inbox')
      heading.textContent = 'Inbox'
      document.body.append(heading)
      vi.advanceTimersByTime(100)

      expect(getRegion()?.textContent).toBe('Inbox')

      heading.remove()
      stop()
    })

    it('should prefer the title of the page to its first heading', () => {
      const [$location, navigation] = virtualNavigation('/home', routes)
      const $page = router($location, [
        page('home', 'Home'),
        page('about', {
          default: 'About',
          Head$: () => [title('About us')]
        })
      ])
      const heading = document.createElement('h1')
      const stop = titleAnnouncer($page)

      navigation.push('/about')
      heading.textContent = 'About'
      document.body.append(heading)
      vi.advanceTimersByTime(100)

      expect(getRegion()?.textContent).toBe('About us')

      heading.remove()
      stop()
    })

    it('should announce a page once it has loaded', async () => {
      const [$location, navigation] = virtualNavigation('/home', routes)
      const aboutPagePromise = Promise.resolve({
        default: 'About',
        Head$: () => [title('About')]
      })
      const $page = router($location, [
        page('home', 'Home'),
        layout({
          default: 'Layout',
          Head$: () => [title('App')]
        }, [
          page('about', loadable(() => aboutPagePromise, 'About Fallback'))
        ])
      ], (_, layout) => layout)
      const stop = titleAnnouncer($page)

      navigation.push('/about')
      vi.advanceTimersByTime(100)

      expect(getRegion()?.textContent).toBe('')

      await aboutPagePromise
      vi.advanceTimersByTime(100)

      expect(getRegion()?.textContent).toBe('About')

      stop()
    })

    it('should drop the announcement of a page navigation moves on from', async () => {
      const [$location, navigation] = virtualNavigation('/home', routes)
      const contactPagePromise = Promise.resolve({
        default: 'Contact',
        Head$: () => [title('Contact')]
      })
      const $page = router($location, [
        page('home', 'Home'),
        page('about', {
          default: 'About',
          Head$: () => [title('About')]
        }),
        layout({
          default: 'Layout',
          Head$: () => [title('App')]
        }, [
          page('contact', loadable(() => contactPagePromise, 'Contact Fallback'))
        ])
      ], (_, layout) => layout)
      const stop = titleAnnouncer($page)

      navigation.push('/about')
      vi.advanceTimersByTime(50)
      navigation.push('/contact')
      vi.advanceTimersByTime(100)

      expect(getRegion()?.textContent).toBe('')

      await contactPagePromise
      vi.advanceTimersByTime(100)

      expect(getRegion()?.textContent).toBe('Contact')

      stop()
    })
  })
})
