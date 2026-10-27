import {
  describe,
  it,
  expect
} from 'vitest'
import {
  render,
  act
} from '@testing-library/preact'
import { InjectionContextProvider } from '@nano_kit/preact'
import {
  provide,
  signal
} from '@nano_kit/store'
import {
  Page$,
  virtualNavigation,
  page,
  title
} from '@nano_kit/router'
import { router } from './core.jsx'
import { useTitle } from './hooks.js'

describe('preact-router', () => {
  describe('hooks', () => {
    describe('useTitle', () => {
      it('should subscribe to the title of the current page', () => {
        const [$location, navigation] = virtualNavigation('/', {
          home: '/home',
          inbox: '/inbox'
        })
        const $count = signal(1)

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
            Head$: () => [title(() => `Inbox (${$count()})`)]
          })
        ])

        function TestApp() {
          const pageTitle = useTitle()

          return (
            <div>
              {pageTitle}
            </div>
          )
        }

        const { container } = render(
          <InjectionContextProvider
            context={[
              provide(Page$, $page)
            ]}
          >
            <TestApp/>
          </InjectionContextProvider>
        )

        act(() => {
          navigation.push('/home')
        })
        expect(container.innerHTML).toBe('<div>Home</div>')

        act(() => {
          navigation.push('/inbox')
        })
        expect(container.innerHTML).toBe('<div>Inbox (1)</div>')

        act(() => {
          $count(2)
        })
        expect(container.innerHTML).toBe('<div>Inbox (2)</div>')
      })
    })
  })
})
