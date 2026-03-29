import {
  describe,
  it,
  expect,
  vi,
  beforeEach
} from 'vitest'
import {
  renderHook,
  act
} from '@testing-library/react'
import {
  mockNavigation,
  mockNavigationModule
} from '../test/navigation.mock.js'
import { useNextNavigation } from './hooks.js'

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
  })
})
