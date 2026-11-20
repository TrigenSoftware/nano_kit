import {
  afterEach,
  describe,
  it,
  expect,
  vi
} from 'vitest'
import {
  render,
  act,
  cleanup
} from '@testing-library/react'
import { InjectionContextProvider } from '@nano_kit/react'
import {
  provide,
  signal
} from '@nano_kit/store'
import {
  LocationNavigation$,
  Page$,
  virtualNavigation,
  page,
  title
} from '@nano_kit/router'
import { router } from './core.jsx'
import {
  useCanGoBack,
  useTitle
} from './hooks.js'

describe('react-router', () => {
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

    describe('useCanGoBack', () => {
      function BackButton() {
        const canGoBack = useCanGoBack()

        return (
          <button disabled={!canGoBack}>
            Back
          </button>
        )
      }

      afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
      })

      it('should subscribe to whether back navigation is possible', () => {
        const locationNavigation = virtualNavigation('/')
        const { container } = render(
          <InjectionContextProvider
            context={[
              provide(LocationNavigation$, locationNavigation)
            ]}
          >
            <BackButton/>
          </InjectionContextProvider>
        )

        expect(container.querySelector('button')!.disabled).toBe(true)

        act(() => {
          locationNavigation[1].push('/about')
        })
        expect(container.querySelector('button')!.disabled).toBe(false)
      })

      it('should hydrate the server markup and update right after', () => {
        const locationNavigation = virtualNavigation('/')
        const container = document.body.appendChild(document.createElement('div'))
        const error = vi.spyOn(console, 'error')

        locationNavigation[1].push('/about')
        // The server knows no history
        container.innerHTML = '<button disabled="">Back</button>'

        render(
          <InjectionContextProvider
            context={[
              provide(LocationNavigation$, locationNavigation)
            ]}
          >
            <BackButton/>
          </InjectionContextProvider>,
          {
            container,
            hydrate: true
          }
        )

        expect(container.querySelector('button')!.disabled).toBe(false)
        expect(error).not.toHaveBeenCalled()
      })
    })
  })
})
