import {
  afterEach,
  describe,
  it,
  expect
} from 'vitest'
import {
  hydrate,
  render as renderToContainer
} from 'preact'
import {
  render,
  act,
  cleanup
} from '@testing-library/preact'
import { InjectionContextProvider } from '@nano_kit/preact'
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

    describe('useCanGoBack', () => {
      function BackButton() {
        const canGoBack = useCanGoBack()

        return (
          <button disabled={!canGoBack}>
            Back
          </button>
        )
      }

      afterEach(cleanup)

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

        locationNavigation[1].push('/about')
        // The server knows no history
        container.innerHTML = '<button disabled="">Back</button>'

        act(() => {
          hydrate(
            <InjectionContextProvider
              context={[
                provide(LocationNavigation$, locationNavigation)
              ]}
            >
              <BackButton/>
            </InjectionContextProvider>,
            container
          )
        })

        expect(container.querySelector('button')!.disabled).toBe(false)

        renderToContainer(null, container)
        container.remove()
      })
    })
  })
})
