import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach
} from 'vitest'
import {
  render,
  act
} from '@testing-library/preact'
import { InjectionContextProvider } from '@nano_kit/preact'
import { provide } from '@nano_kit/store'
import {
  Page$,
  virtualNavigation,
  page,
  layout,
  title
} from '@nano_kit/router'
import {
  Outlet,
  router,
  usePageSignal,
  useTitleAnnouncer
} from './core.jsx'

describe('preact-router', () => {
  describe('core', () => {
    it('should match correct page component based on route', () => {
      const [$location, navigation] = virtualNavigation('/', {
        home: '/home',
        about: '/about'
      })

      function HomePage() {
        return <div>Home Page</div>
      }

      function AboutPage() {
        return <div>About Page</div>
      }

      const $page = router($location, [
        page('home', HomePage),
        page('about', AboutPage)
      ])

      function TestApp() {
        const Page = usePageSignal($page)

        return Page ? <Page/> : <div>Not Found</div>
      }

      const { container } = render(
        <TestApp/>
      )

      act(() => {
        navigation.push('/home')
      })
      expect(container.innerHTML).toBe('<div>Home Page</div>')

      act(() => {
        navigation.push('/about')
      })
      expect(container.innerHTML).toBe('<div>About Page</div>')

      act(() => {
        navigation.push('/unknown')
      })
      expect(container.innerHTML).toBe('<div>Not Found</div>')
    })

    describe('layout', () => {
      it('should compose layout with nested content using Outlet', () => {
        const [$location, navigation] = virtualNavigation('/', {
          home: '/home',
          login: '/login',
          register: '/register'
        })

        function HomePage() {
          return <div>Home Page</div>
        }

        function LoginPage() {
          return <div>Login Page</div>
        }

        function RegisterPage() {
          return <div>Register Page</div>
        }

        let authLayoutRenders = 0

        function AuthLayout() {
          return (
            <div className='auth-layout'>
              <header>
                Auth Header
                {' '}
                {++authLayoutRenders}
              </header>
              <main>
                <Outlet/>
              </main>
            </div>
          )
        }

        const $page = router($location, [
          page('home', HomePage),
          layout(AuthLayout, [
            page('login', LoginPage),
            page('register', RegisterPage)
          ])
        ])

        function TestApp() {
          const Page = usePageSignal($page)

          return Page ? <Page/> : <div>Not Found</div>
        }

        const { container } = render(
          <TestApp/>
        )

        act(() => {
          navigation.push('/login')
        })
        expect(container.innerHTML).toBe(
          '<div class="auth-layout"><header>Auth Header 1</header><main><div>Login Page</div></main></div>'
        )

        act(() => {
          navigation.push('/register')
        })
        expect(container.innerHTML).toBe(
          '<div class="auth-layout"><header>Auth Header 1</header><main><div>Register Page</div></main></div>'
        )

        act(() => {
          navigation.push('/home')
        })
        expect(container.innerHTML).toBe('<div>Home Page</div>')
      })

      it('should handle complex nested layout structure', () => {
        const [$location, navigation] = virtualNavigation('/', {
          home: '/home',
          about: '/about',
          login: '/login',
          register: '/register',
          dashboard: '/dashboard',
          settings: '/settings'
        })

        function HomePage() {
          return <div>Home</div>
        }

        function AboutPage() {
          return <div>About</div>
        }

        function LoginPage() {
          return <div>Login</div>
        }

        function RegisterPage() {
          return <div>Register</div>
        }

        function DashboardPage() {
          return <div>Dashboard</div>
        }

        function SettingsPage() {
          return <div>Settings</div>
        }

        let authLayoutRenders = 0
        let dashboardLayoutRenders = 0

        function AuthLayout() {
          return (
            <div className='auth'>
              <span>
                Auth
                {' '}
                {++authLayoutRenders}
              </span>
              <Outlet/>
            </div>
          )
        }

        function DashboardLayout() {
          return (
            <div className='dashboard'>
              <span>
                Dashboard
                {' '}
                {++dashboardLayoutRenders}
              </span>
              <Outlet/>
            </div>
          )
        }

        const $page = router($location, [
          page('home', HomePage),
          page('about', AboutPage),
          layout(AuthLayout, [
            page('login', LoginPage),
            page('register', RegisterPage),
            layout(DashboardLayout, [
              page('dashboard', DashboardPage),
              page('settings', SettingsPage)
            ])
          ])
        ])

        function TestApp() {
          const Page = usePageSignal($page)

          return Page ? <Page/> : <div>Not Found</div>
        }

        const { container } = render(
          <TestApp/>
        )

        act(() => {
          navigation.push('/settings')
        })
        expect(container.innerHTML).toBe(
          '<div class="auth"><span>Auth 1</span><div class="dashboard"><span>Dashboard 1</span><div>Settings</div></div></div>'
        )

        act(() => {
          navigation.push('/dashboard')
        })
        expect(container.innerHTML).toBe(
          '<div class="auth"><span>Auth 1</span><div class="dashboard"><span>Dashboard 1</span><div>Dashboard</div></div></div>'
        )

        act(() => {
          navigation.push('/login')
        })
        expect(container.innerHTML).toBe(
          '<div class="auth"><span>Auth 1</span><div>Login</div></div>'
        )

        act(() => {
          navigation.push('/home')
        })
        expect(container.innerHTML).toBe('<div>Home</div>')

        act(() => {
          navigation.push('/about')
        })
        expect(container.innerHTML).toBe('<div>About</div>')
      })
    })

    describe('useTitleAnnouncer', () => {
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

        function Page() {
          return null
        }

        const $page = router($location, [
          page('home', {
            default: Page,
            Head$: () => [title('Home')]
          }),
          page('inbox', {
            default: Page,
            Head$: () => [title('Inbox')]
          })
        ])

        function TestApp() {
          useTitleAnnouncer()

          return null
        }

        const { unmount } = render(
          <InjectionContextProvider
            context={[
              provide(Page$, $page)
            ]}
          >
            <TestApp/>
          </InjectionContextProvider>
        )
        const region = document.querySelector('body > nano-kit-title-announcer')?.shadowRoot?.querySelector('[role="status"]')

        act(() => {
          navigation.push('/inbox')
          vi.advanceTimersByTime(100)
        })
        expect(region?.textContent).toBe('Inbox')

        // Preact runs passive cleanups of an unmount after paint, act flushes them
        act(() => {
          unmount()
        })
        expect(region?.isConnected).toBe(false)
      })
    })
  })
})
