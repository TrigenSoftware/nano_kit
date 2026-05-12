import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest'
import {
  cleanup,
  render
} from '@testing-library/svelte'
import { tick } from 'svelte'
import {
  goto,
  resetNavigation,
  triggerAfterNavigate
} from '../test/app-navigation.js'
import { setPageUrl } from '../test/app-state.js'
import NavigationFixture from '../test/NavigationFixture.svelte'
import {
  getNavigationState,
  resetNavigationState
} from '../test/navigation-state.js'

describe('svelte-kit', () => {
  describe('navigation', () => {
    describe('getNavigation', () => {
      beforeEach(() => {
        resetNavigation()
        resetNavigationState()
      })

      afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
      })

      it('should return current location from page url', () => {
        setPageUrl('/user/42?tab=info')

        const { getByTestId } = render(NavigationFixture)
        const [location] = getNavigationState()

        expect(getByTestId('pathname').textContent).toBe('/user/42')
        expect(getByTestId('route').textContent).toBe('user')
        expect(getByTestId('params').textContent).toBe('{"id":"42"}')
        expect(location().pathname).toBe('/user/42')
        expect(location().route).toBe('user')
        expect(location().params).toEqual({
          id: '42'
        })
      })

      it('should update location after sveltekit navigation', async () => {
        const { getByTestId } = render(NavigationFixture)
        const [location] = getNavigationState()

        triggerAfterNavigate('/about')
        await tick()

        expect(getByTestId('pathname').textContent).toBe('/about')
        expect(getByTestId('route').textContent).toBe('about')
        expect(location().pathname).toBe('/about')
        expect(location().route).toBe('about')
      })

      it('should call goto on navigation.push', () => {
        render(NavigationFixture)

        const [, navigation] = getNavigationState()

        navigation.push('/about')

        expect(goto).toHaveBeenCalledWith('/about')
      })

      it('should call goto with replaceState on navigation.replace', () => {
        render(NavigationFixture)

        const [, navigation] = getNavigationState()

        navigation.replace('/about')

        expect(goto).toHaveBeenCalledWith('/about', {
          replaceState: true
        })
      })

      it('should call history.back on navigation.back', () => {
        const back = vi.spyOn(history, 'back').mockImplementation(() => undefined)

        render(NavigationFixture)

        const [, navigation] = getNavigationState()

        navigation.back()

        expect(back).toHaveBeenCalled()
      })

      it('should call history.forward on navigation.forward', () => {
        const forward = vi.spyOn(history, 'forward').mockImplementation(() => undefined)

        render(NavigationFixture)

        const [, navigation] = getNavigationState()

        navigation.forward()

        expect(forward).toHaveBeenCalled()
      })

      it('should resolve route params from path in push', () => {
        render(NavigationFixture)

        const [, navigation] = getNavigationState()

        navigation.push('/user/42')

        expect(goto).toHaveBeenCalledWith('/user/42')
      })
    })
  })
})
