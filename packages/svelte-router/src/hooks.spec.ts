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
import { provide } from '@nano_kit/store'
import {
  type Routes,
  LocationNavigation$,
  virtualNavigation
} from '@nano_kit/router'
import HooksFixture from '../test/HooksFixture.svelte'

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
  })
})
