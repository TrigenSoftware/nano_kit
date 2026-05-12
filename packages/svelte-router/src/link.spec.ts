import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest'
import {
  buildPaths,
  notFound,
  page,
  virtualNavigation
} from '@nano_kit/router'
import {
  cleanup,
  render
} from '@testing-library/svelte'
import { tick } from 'svelte'
import { router } from './core.js'
import { linkComponent } from './link.js'
import LinkFixture from '../test/LinkFixture.svelte'
import DynamicLinkPropsFixture from '../test/DynamicLinkPropsFixture.svelte'
import HomePage from '../test/pages/HomePage.svelte'
import AboutPage from '../test/pages/AboutPage.svelte'
import NotFoundPage from '../test/pages/NotFoundPage.svelte'

afterEach(cleanup)

describe('svelte-router', () => {
  describe('link', () => {
    it('should create link elements that navigate without full page reload', async () => {
      const routes = {
        home: '/home',
        about: '/about'
      }
      const [$location, navigation] = virtualNavigation('/', routes)
      const paths = buildPaths(routes)
      const Link = linkComponent(navigation, paths)
      const $page = router($location, [
        page('home', HomePage),
        page('about', AboutPage),
        notFound(NotFoundPage)
      ])
      const { container } = render(LinkFixture, {
        props: {
          Link,
          page: $page
        }
      })
      const nav = container.querySelector('nav')!
      const [
        home,
        about
      ] = nav.children as HTMLCollectionOf<HTMLAnchorElement>

      expect(container.innerHTML).toContain('Not Found')

      home.click()
      await tick()

      expect(container.innerHTML).toContain('Home Page')
      expect($location().href).toBe('/home')

      about.click()
      await tick()

      expect(container.innerHTML).toContain('About Page')
      expect($location().href).toBe('/about')
    })

    it('should update link attributes when props change', async () => {
      const routes = {
        character: '/character/:id'
      }
      const [, navigation] = virtualNavigation('/', routes)
      const paths = buildPaths(routes)
      const Link = linkComponent(navigation, paths)
      const { container } = render(DynamicLinkPropsFixture, {
        props: {
          Link
        }
      })
      const button = container.querySelector('button')!
      const link = container.querySelector('a')!

      expect(link.getAttribute('href')).toBe('/character/1')
      expect(link.getAttribute('class')).toBe('page-1')
      expect(link.getAttribute('aria-current')).toBeNull()
      expect(link.getAttribute('aria-label')).toBe('Go to page 1')
      expect(link.textContent?.trim()).toBe('Page 1')

      button.click()
      await tick()

      expect(link.getAttribute('href')).toBe('/character/2')
      expect(link.getAttribute('class')).toBe('page-2')
      expect(link.getAttribute('aria-current')).toBe('page')
      expect(link.getAttribute('aria-label')).toBe('Go to page 2')
      expect(link.textContent?.trim()).toBe('Page 2')
    })
  })
})
