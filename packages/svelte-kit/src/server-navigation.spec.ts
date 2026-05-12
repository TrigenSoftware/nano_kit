import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest'
import { redirect } from '@sveltejs/kit'
import { resetRequestEvent } from '../test/app-server.js'
import { serverNavigation } from './server-navigation.js'

vi.mock('@sveltejs/kit', () => ({
  redirect: vi.fn()
}))

const routes = {
  home: '/',
  about: '/about',
  user: '/user/:id'
} as const

describe('svelte-kit', () => {
  describe('server-navigation', () => {
    describe('serverNavigation', () => {
      beforeEach(() => {
        resetRequestEvent()
        vi.mocked(redirect).mockReset()
      })

      it('should return location from current request URL', () => {
        const [location] = serverNavigation(routes)

        expect(location().pathname).toBe('/')
        expect(location().route).toBe('home')
      })

      it('should match route with params from pathname', () => {
        resetRequestEvent('text/html', '/user/42?tab=info#bio')

        const [location] = serverNavigation(routes)

        expect(location().pathname).toBe('/user/42')
        expect(location().search).toBe('?tab=info')
        expect(location().hash).toBe('#bio')
        expect(location().route).toBe('user')
        expect(location().params).toEqual({
          id: '42'
        })
      })

      it('should call redirect with temporary status on navigation.push', () => {
        const [, navigation] = serverNavigation(routes)

        navigation.push('/about')

        expect(redirect).toHaveBeenCalledWith(307, '/about')
      })

      it('should call redirect with temporary status on navigation.replace', () => {
        const [, navigation] = serverNavigation(routes)

        navigation.replace('/about')

        expect(redirect).toHaveBeenCalledWith(307, '/about')
      })

      it('should call redirect with permanent status on permanent navigation.replace', () => {
        const [, navigation] = serverNavigation(routes)

        navigation.replace('/about', true)

        expect(redirect).toHaveBeenCalledWith(308, '/about')
      })

      it('should be a noop for navigation.back and navigation.forward', () => {
        const [, navigation] = serverNavigation(routes)

        expect(() => navigation.back()).not.toThrow()
        expect(() => navigation.forward()).not.toThrow()
        expect(redirect).not.toHaveBeenCalled()
      })
    })
  })
})
