import {
  vi,
  afterEach,
  beforeEach,
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
  Page$,
  layout,
  page,
  title,
  virtualNavigation
} from '@nano_kit/router'
import { router } from './core.js'
import TitleAnnouncerFixture from '../test/TitleAnnouncerFixture.svelte'
import RouterAppFixture from '../test/RouterAppFixture.svelte'
import PageTitleFixture from '../test/PageTitleFixture.svelte'
import HomePage from '../test/pages/HomePage.svelte'
import AboutPage from '../test/pages/AboutPage.svelte'
import LoginPage from '../test/pages/LoginPage.svelte'
import RegisterPage from '../test/pages/RegisterPage.svelte'
import HomeShortPage from '../test/pages/HomeShortPage.svelte'
import AboutShortPage from '../test/pages/AboutShortPage.svelte'
import LoginShortPage from '../test/pages/LoginShortPage.svelte'
import RegisterShortPage from '../test/pages/RegisterShortPage.svelte'
import DashboardPage from '../test/pages/DashboardPage.svelte'
import SettingsPage from '../test/pages/SettingsPage.svelte'
import AuthLayout from '../test/layouts/AuthLayout.svelte'
import AuthShortLayout from '../test/layouts/AuthShortLayout.svelte'
import DashboardLayout from '../test/layouts/DashboardLayout.svelte'
import {
  resetAuthLayoutRenders,
  resetAuthShortLayoutRenders,
  resetDashboardLayoutRenders
} from '../test/layouts/renders.js'

function getHtml(container: HTMLElement) {
  return container.innerHTML.replaceAll('<!---->', '')
}

afterEach(cleanup)

describe('svelte-router', () => {
  describe('core', () => {
    it('should match correct page component based on route', async () => {
      const [$location, navigation] = virtualNavigation('/', {
        home: '/home',
        about: '/about'
      })
      const $page = router($location, [
        page('home', HomePage),
        page('about', AboutPage)
      ])
      const { container } = render(RouterAppFixture, {
        props: {
          page: $page
        }
      })

      navigation.push('/home')
      await tick()

      expect(getHtml(container)).toBe('<div>Home Page</div>')

      navigation.push('/about')
      await tick()

      expect(getHtml(container)).toBe('<div>About Page</div>')

      navigation.push('/unknown')
      await tick()

      expect(getHtml(container)).toBe('<div>Not Found</div>')
    })

    describe('layout', () => {
      it('should compose layout with nested content using Outlet', async () => {
        resetAuthLayoutRenders()

        const [$location, navigation] = virtualNavigation('/', {
          home: '/home',
          login: '/login',
          register: '/register'
        })
        const $page = router($location, [
          page('home', HomePage),
          layout(AuthLayout, [
            page('login', LoginPage),
            page('register', RegisterPage)
          ])
        ])
        const { container } = render(RouterAppFixture, {
          props: {
            page: $page
          }
        })

        navigation.push('/login')
        await tick()

        expect(getHtml(container)).toBe(
          '<div class="auth-layout"><header>Auth Header 1</header> <main><div>Login Page</div></main></div>'
        )

        navigation.push('/register')
        await tick()

        expect(getHtml(container)).toBe(
          '<div class="auth-layout"><header>Auth Header 1</header> <main><div>Register Page</div></main></div>'
        )

        navigation.push('/home')
        await tick()

        expect(getHtml(container)).toBe('<div>Home Page</div>')
      })

      it('should handle complex nested layout structure', async () => {
        resetAuthShortLayoutRenders()
        resetDashboardLayoutRenders()

        const [$location, navigation] = virtualNavigation('/', {
          home: '/home',
          about: '/about',
          login: '/login',
          register: '/register',
          dashboard: '/dashboard',
          settings: '/settings'
        })
        const $page = router($location, [
          page('home', HomeShortPage),
          page('about', AboutShortPage),
          layout(AuthShortLayout, [
            page('login', LoginShortPage),
            page('register', RegisterShortPage),
            layout(DashboardLayout, [
              page('dashboard', DashboardPage),
              page('settings', SettingsPage)
            ])
          ])
        ])
        const { container } = render(RouterAppFixture, {
          props: {
            page: $page
          }
        })

        navigation.push('/settings')
        await tick()

        expect(getHtml(container)).toBe(
          '<div class="auth"><span>Auth 1</span> <div class="dashboard"><span>Dashboard 1</span> <div>Settings</div></div></div>'
        )

        navigation.push('/dashboard')
        await tick()

        expect(getHtml(container)).toBe(
          '<div class="auth"><span>Auth 1</span> <div class="dashboard"><span>Dashboard 1</span> <div>Dashboard</div></div></div>'
        )

        navigation.push('/login')
        await tick()

        expect(getHtml(container)).toBe(
          '<div class="auth"><span>Auth 1</span> <div>Login</div></div>'
        )

        navigation.push('/home')
        await tick()

        expect(getHtml(container)).toBe('<div>Home</div>')

        navigation.push('/about')
        await tick()

        expect(getHtml(container)).toBe('<div>About</div>')
      })
    })

    describe('getPageTitle', () => {
      it('should return the title signal of the current page', async () => {
        const [$location, navigation] = virtualNavigation('/', {
          home: '/home',
          about: '/about'
        })
        const $page = router($location, [
          page('home', {
            default: HomePage,
            Head$: () => [title('Home')]
          }),
          page('about', {
            default: AboutPage,
            Head$: () => [title('About')]
          })
        ])
        const { getByTestId } = render(PageTitleFixture, {
          props: {
            page: $page
          }
        })

        navigation.push('/home')
        await tick()

        expect(getByTestId('title').textContent).toBe('Home')

        navigation.push('/about')
        await tick()

        expect(getByTestId('title').textContent).toBe('About')
      })
    })

    describe('titleAnnouncer', () => {
      beforeEach(() => {
        vi.useFakeTimers()
      })

      afterEach(() => {
        vi.useRealTimers()
      })

      it('should announce the title of the page navigation arrives at', () => {
        const [$location, navigation] = virtualNavigation('/home', {
          home: '/home',
          inbox: '/inbox'
        })
        const $page = router($location, [
          page('home', {
            default: HomePage,
            Head$: () => [title('Home')]
          }),
          page('inbox', {
            default: AboutPage,
            Head$: () => [title('Inbox')]
          })
        ])
        const { unmount } = render(TitleAnnouncerFixture, {
          props: {
            context: [
              provide(Page$, $page)
            ]
          }
        })
        const region = document.querySelector('body > nano-kit-title-announcer')?.shadowRoot?.querySelector('[role="status"]')

        navigation.push('/inbox')
        vi.advanceTimersByTime(100)

        expect(region?.textContent).toBe('Inbox')

        unmount()

        expect(region?.isConnected).toBe(false)
      })
    })
  })
})
