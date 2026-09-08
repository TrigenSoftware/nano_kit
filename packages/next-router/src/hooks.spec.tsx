import {
  describe,
  it,
  expect,
  vi,
  beforeEach
} from 'vitest'
import type { PropsWithChildren } from 'react'
import {
  renderHook,
  act
} from '@testing-library/react'
import { provide } from '@nano_kit/store'
import { InjectionContextProvider } from '@nano_kit/react'
import {
  type Routes,
  LocationNavigation$,
  virtualNavigation
} from '@nano_kit/router'
import {
  mockNavigation,
  mockNavigationModule
} from '../test/navigation.mock.js'
import {
  useNextNavigation,
  useShouldProvideNextNavigation
} from './hooks.js'

vi.mock('next/navigation.js', () => mockNavigationModule)

const routes = {
  home: '/',
  about: '/about',
  user: '/user/:id'
} as const

describe('next-router', () => {
  describe('hooks', () => {
    describe('useNextNavigation', () => {
      beforeEach(() => {
        mockNavigation.reset()
      })

      it('should return current location from pathname', () => {
        const { result } = renderHook(() => useNextNavigation(routes))
        const [$location] = result.current

        expect($location().pathname).toBe('/')
        expect($location().route).toBe('home')
      })

      it('should call nextRouter.push on navigation.push', () => {
        const { result } = renderHook(() => useNextNavigation(routes))
        const [, navigation] = result.current

        act(() => {
          navigation.push('/about')
        })

        expect(mockNavigation.push).toHaveBeenCalledWith('/about')
      })

      it('should call nextRouter.replace on navigation.replace', () => {
        const { result } = renderHook(() => useNextNavigation(routes))
        const [, navigation] = result.current

        act(() => {
          navigation.replace('/about')
        })

        expect(mockNavigation.replace).toHaveBeenCalledWith('/about')
      })

      it('should call nextRouter.back on navigation.back', () => {
        const { result } = renderHook(() => useNextNavigation(routes))
        const [, navigation] = result.current

        act(() => {
          navigation.back()
        })

        expect(mockNavigation.back).toHaveBeenCalled()
      })

      it('should call nextRouter.forward on navigation.forward', () => {
        const { result } = renderHook(() => useNextNavigation(routes))
        const [, navigation] = result.current

        act(() => {
          navigation.forward()
        })

        expect(mockNavigation.forward).toHaveBeenCalled()
      })

      it('should resolve route params from path in push', () => {
        const { result } = renderHook(() => useNextNavigation(routes))
        const [, navigation] = result.current

        act(() => {
          navigation.push('/user/42')
        })

        expect(mockNavigation.push).toHaveBeenCalledWith('/user/42')
      })
    })

    describe('useShouldProvideNextNavigation', () => {
      beforeEach(() => {
        mockNavigation.reset()
      })

      it('should provide navigation when there is no location in the injection context', () => {
        const { result } = renderHook(() => useShouldProvideNextNavigation())

        expect(result.current).toBe(true)
      })

      it('should not provide navigation when the location above already has search params', () => {
        mockNavigation.search = 'page=2'

        const locationNavigation = virtualNavigation<Routes>('/?page=2', routes)
        const wrapper = ({ children }: PropsWithChildren) => (
          <InjectionContextProvider context={[provide(LocationNavigation$, locationNavigation)]}>
            {children}
          </InjectionContextProvider>
        )
        const { result } = renderHook(() => useShouldProvideNextNavigation(), {
          wrapper
        })

        expect(result.current).toBe(false)
      })

      it('should provide navigation when the location above was created without search params and they are available now', () => {
        mockNavigation.searchParamsAvailable = false

        const { result: outer } = renderHook(() => useNextNavigation(routes))

        mockNavigation.searchParamsAvailable = true
        mockNavigation.search = 'page=2'

        const wrapper = ({ children }: PropsWithChildren) => (
          <InjectionContextProvider context={[provide(LocationNavigation$, outer.current as unknown)]}>
            {children}
          </InjectionContextProvider>
        )
        const { result } = renderHook(() => useShouldProvideNextNavigation(), {
          wrapper
        })

        expect(result.current).toBe(true)
      })

      it('should not provide navigation while search params stay unavailable', () => {
        mockNavigation.searchParamsAvailable = false

        const { result: outer } = renderHook(() => useNextNavigation(routes))
        const wrapper = ({ children }: PropsWithChildren) => (
          <InjectionContextProvider context={[provide(LocationNavigation$, outer.current as unknown)]}>
            {children}
          </InjectionContextProvider>
        )
        const { result } = renderHook(() => useShouldProvideNextNavigation(), {
          wrapper
        })

        expect(result.current).toBe(false)
      })
    })
  })
})
