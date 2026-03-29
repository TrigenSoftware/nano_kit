import {
  describe,
  it,
  expect,
  vi,
  beforeEach
} from 'vitest'
import {
  mockNavigationModule,
  mockAsyncStorage,
  mockEntryBaseModule
} from '../test/navigation.mock.js'
import { getServerNextNavigation } from './server.js'

vi.mock('next/navigation.js', () => mockNavigationModule)
vi.mock('next/dist/server/app-render/work-unit-async-storage.external.js', () => mockEntryBaseModule)

const routes = {
  home: '/',
  about: '/about',
  user: '/user/:id'
} as const

describe('next-router', () => {
  describe('server', () => {
    describe('getServerNavigation', () => {
      beforeEach(() => {
        mockAsyncStorage.reset()
        mockNavigationModule.redirect.mockReset()
      })

      it('should return location from current request URL', () => {
        const [$location] = getServerNextNavigation(routes)

        expect($location().pathname).toBe('/')
        expect($location().route).toBe('home')
      })

      it('should match route with params from pathname', () => {
        mockAsyncStorage.url.pathname = '/user/42'

        const [$location] = getServerNextNavigation(routes)

        expect($location().pathname).toBe('/user/42')
        expect($location().route).toBe('user')
      })

      it('should call redirect with push type on navigation.push', () => {
        const [, navigation] = getServerNextNavigation(routes)

        navigation.push('/about')

        expect(mockNavigationModule.redirect).toHaveBeenCalledWith('/about', 'push')
      })

      it('should call redirect with replace type on navigation.replace', () => {
        const [, navigation] = getServerNextNavigation(routes)

        navigation.replace('/about')

        expect(mockNavigationModule.redirect).toHaveBeenCalledWith('/about', 'replace')
      })

      it('should be a noop for navigation.back and navigation.forward', () => {
        const [, navigation] = getServerNextNavigation(routes)

        expect(() => navigation.back()).not.toThrow()
        expect(() => navigation.forward()).not.toThrow()
        expect(mockNavigationModule.redirect).not.toHaveBeenCalled()
      })
    })
  })
})
