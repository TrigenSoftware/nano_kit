import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest'
import {
  cleanup,
  fireEvent,
  render
} from '@testing-library/svelte'
import { tick } from 'svelte'
import {
  provide,
  signal
} from '@nano_kit/store'
import {
  type Routes,
  LocationNavigation$,
  Page$,
  page,
  title,
  virtualNavigation
} from '@nano_kit/router'
import { router } from './core.js'
import HooksFixture from '../test/HooksFixture.svelte'
import TitleFixture from '../test/TitleFixture.svelte'
import HomePage from '../test/pages/HomePage.svelte'
import AboutPage from '../test/pages/AboutPage.svelte'

const routes = {
  home: '/',
  about: '/about'
} as const

function renderFixture(path: string) {
  const locationNavigation = virtualNavigation<Routes>(path, routes)
  const rendered = render(HooksFixture, {
    props: {
      context: [
        provide(LocationNavigation$, locationNavigation)
      ]
    }
  })

  return {
    ...rendered,
    navigation: locationNavigation[1]
  }
}

afterEach(cleanup)

describe('svelte-router', () => {
  describe('hooks', () => {
    describe('getLocation', () => {
      it('should return the location signal from the injection context', async () => {
        const { getByTestId, navigation } = renderFixture('/')

        expect(getByTestId('pathname').textContent).toBe('/')
        expect(getByTestId('route').textContent).toBe('home')

        navigation.push('/about')
        await tick()

        expect(getByTestId('pathname').textContent).toBe('/about')
        expect(getByTestId('route').textContent).toBe('about')
      })
    })

    describe('getNavigation', () => {
      it('should return the navigation from the injection context', async () => {
        const { getByTestId, getByText } = renderFixture('/')

        await fireEvent.click(getByText('Go'))
        await tick()

        expect(getByTestId('pathname').textContent).toBe('/about')
      })
    })

    describe('getPaths', () => {
      it('should return the path builders from the injection context', () => {
        const { getByTestId } = renderFixture('/')

        expect(getByTestId('about').textContent).toBe('/about')
      })
    })

    describe('getCanGoBack', () => {
      it('should return the can go back signal from the injection context', async () => {
        const { getByTestId, navigation } = renderFixture('/')

        expect(getByTestId('can-go-back').textContent).toBe('false')

        navigation.push('/about')
        await tick()

        expect(getByTestId('can-go-back').textContent).toBe('true')
      })
    })

    describe('getTitle', () => {
      it('should return the title signal of the current page from the injection context', async () => {
        const [$location, navigation] = virtualNavigation('/', {
          home: '/home',
          inbox: '/inbox'
        })
        const $count = signal(1)
        const $page = router($location, [
          page('home', {
            default: HomePage,
            Head$: () => [title('Home')]
          }),
          page('inbox', {
            default: AboutPage,
            Head$: () => [title(() => `Inbox (${$count()})`)]
          })
        ])
        const { getByTestId } = render(TitleFixture, {
          props: {
            context: [
              provide(Page$, $page)
            ]
          }
        })

        navigation.push('/home')
        await tick()

        expect(getByTestId('title').textContent).toBe('Home')

        navigation.push('/inbox')
        await tick()

        expect(getByTestId('title').textContent).toBe('Inbox (1)')

        $count(2)
        await tick()

        expect(getByTestId('title').textContent).toBe('Inbox (2)')
      })
    })
  })
})
