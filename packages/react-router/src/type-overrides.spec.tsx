import {
  describe,
  it,
  expect
} from 'vitest'
import {
  render,
  act
} from '@testing-library/react'
import { virtualNavigation } from '@nano_kit/router'
import {
  Outlet,
  router,
  usePageSignal
} from './core.jsx'
import {
  layout,
  page,
  notFound
} from './type-overrides.js'

describe('react-router', () => {
  describe('type-overrides', () => {
    describe('layout', () => {
      it('should render not found page in a layout of its own', () => {
        const [$location, navigation] = virtualNavigation('/home', {
          home: '/home'
        })

        function HomePage() {
          return <div>Home Page</div>
        }

        function NotFoundPage() {
          return <div>Not Found</div>
        }

        function RootLayout() {
          return (
            <div className='root-layout'>
              <Outlet/>
            </div>
          )
        }

        function SiteLayout() {
          return (
            <main>
              <Outlet/>
            </main>
          )
        }

        const $page = router($location, [
          layout(RootLayout, [
            page('home', HomePage),
            layout(SiteLayout, [
              notFound(NotFoundPage)
            ])
          ])
        ])

        function TestApp() {
          const Page = usePageSignal($page)

          return Page && <Page/>
        }

        const { container } = render(
          <TestApp/>
        )

        expect(container.innerHTML).toBe(
          '<div class="root-layout"><div>Home Page</div></div>'
        )

        act(() => {
          navigation.push('/unknown')
        })
        expect(container.innerHTML).toBe(
          '<div class="root-layout"><main><div>Not Found</div></main></div>'
        )
      })
    })
  })
})
