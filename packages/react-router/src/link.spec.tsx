import {
  describe,
  it,
  expect
} from 'vitest'
import {
  render,
  act
} from '@testing-library/react'
import {
  virtualNavigation,
  page,
  notFound,
  buildPaths
} from '@nano_kit/router'
import {
  router,
  usePageSignal
} from './core.jsx'
import { linkComponent } from './link.js'

describe('react-router', () => {
  describe('link', () => {
    it('should create link elements that navigate without full page reload', () => {
      const routes = {
        home: '/home',
        about: '/about'
      }
      const [$location, navigation] = virtualNavigation('/', routes)
      const paths = buildPaths(routes)
      const Link = linkComponent(navigation, paths)

      function HomePage() {
        return <div>Home Page</div>
      }

      function AboutPage() {
        return <div>About Page</div>
      }

      function NotFoundPage() {
        return <div>Not Found</div>
      }

      const $page = router($location, [
        page('home', HomePage),
        page('about', AboutPage),
        notFound(NotFoundPage)
      ])

      function App() {
        const Page = usePageSignal($page)

        return Page && <Page/>
      }

      const { container } = render(
        <div>
          <nav>
            <Link to='home'>Home</Link>
            <Link to='about'>About</Link>
          </nav>
          <App/>
        </div>
      )
      const nav = container.querySelector('nav')!
      const homeLink = nav.children[0] as HTMLAnchorElement
      const aboutLink = nav.children[1] as HTMLAnchorElement

      expect(container.innerHTML).toContain('Not Found')

      act(() => {
        homeLink.click()
      })
      expect(container.innerHTML).toContain('Home Page')
      expect($location().href).toBe('/home')

      act(() => {
        aboutLink.click()
      })
      expect(container.innerHTML).toContain('About Page')
      expect($location().href).toBe('/about')
    })
  })
})
