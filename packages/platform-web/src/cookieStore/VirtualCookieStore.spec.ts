import {
  describe,
  expect,
  it
} from 'vitest'
import { VirtualCookieStore } from './VirtualCookieStore.js'

describe('platform-web', () => {
  describe('cookieStore', () => {
    describe('VirtualCookieStore', () => {
      it('should read cookies from a request header', async () => {
        const store = new VirtualCookieStore('theme=dark; session=abc123')

        expect(store.peek('theme')).toBe('dark')
        await expect(store.get('theme')).resolves.toEqual({
          name: 'theme',
          value: 'dark'
        })
        await expect(store.getAll()).resolves.toEqual([
          {
            name: 'theme',
            value: 'dark'
          },
          {
            name: 'session',
            value: 'abc123'
          }
        ])
      })

      it('should track set-cookie headers for mutations', async () => {
        const store = new VirtualCookieStore('theme=dark')

        await store.set({
          name: 'theme',
          value: 'light',
          sameSite: 'lax',
          secure: true
        })
        await store.set({
          name: 'session',
          value: 'abc123',
          path: '/app',
          maxAge: 60
        })

        expect(store.getSetCookieHeaders()).toEqual([
          'theme=light; Path=/; SameSite=Lax; Secure',
          expect.stringMatching(/^session=abc123; Path=\/app; Expires=.*; Max-Age=60$/)
        ])
        await expect(store.getAll()).resolves.toEqual([
          {
            name: 'theme',
            value: 'light',
            path: '/',
            sameSite: 'lax',
            secure: true
          },
          {
            name: 'session',
            value: 'abc123',
            expires: expect.any(Number),
            path: '/app'
          }
        ])
      })

      it('should drain pending set-cookie headers', async () => {
        const store = new VirtualCookieStore()

        await store.set('theme', 'dark')

        expect(store.drainSetCookieHeaders()).toEqual([
          'theme=dark; Path=/'
        ])
        expect(store.getSetCookieHeaders()).toEqual([])
      })

      it('should serialize deletes as set-cookie expirations', async () => {
        const store = new VirtualCookieStore('session=abc123')

        await store.delete('session')

        expect(store.getSetCookieHeaders()).toEqual([
          'session=; Path=/; Max-Age=0'
        ])
        await expect(store.get('session')).resolves.toBe(null)
      })

      it('should treat immediate-expiration set calls as deletions', async () => {
        const store = new VirtualCookieStore('theme=dark')

        await store.set({
          name: 'theme',
          value: 'dark',
          maxAge: 0
        })

        expect(store.getSetCookieHeaders()).toEqual([
          'theme=; Path=/; Max-Age=0'
        ])
      })

      it('should keep event surface as a no-op', async () => {
        const store = new VirtualCookieStore('theme=dark')

        store.onchange = () => {
          throw new Error('virtual cookie store should not emit change events')
        }

        store.addEventListener()
        store.removeEventListener()

        store.onchange = () => {
          throw new Error('virtual cookie store should not register listeners')
        }

        await store.set('feature', 'on')
        await store.set('theme', 'light')

        expect(store.dispatchEvent()).toBe(false)
      })

      it('should validate request-bound urls in get/getAll', async () => {
        const store = new VirtualCookieStore('theme=dark', 'https://example.com/app')

        await expect(store.get({
          name: 'theme',
          url: 'https://example.com/app'
        })).resolves.toEqual({
          name: 'theme',
          value: 'dark'
        })

        await expect(store.getAll({
          url: 'https://example.com/other'
        })).rejects.toThrow('single request URL')
      })

      it('should throw at the call on a value that would add attributes to the cookie', () => {
        const store = new VirtualCookieStore()

        expect(() => store.set('locale', 'de; Domain=example.com')).toThrow(TypeError)
        expect(store.getSetCookieHeaders()).toEqual([])
      })

      it('should throw at the call on a control character in a value', () => {
        const store = new VirtualCookieStore()

        expect(() => store.set('locale', 'de\r\nX-Injected: 1')).toThrow(TypeError)
      })

      it('should throw at the call on "=" in a name', () => {
        const store = new VirtualCookieStore()

        expect(() => store.set('a=b', 'c')).toThrow(TypeError)
      })

      it('should throw at the call on a name that would add attributes on delete', () => {
        const store = new VirtualCookieStore()

        expect(() => store.delete('a; Domain=example.com')).toThrow(TypeError)
      })

      it('should resolve the promise of a write', async () => {
        const store = new VirtualCookieStore()

        await expect(store.set('locale', 'de')).resolves.toBeUndefined()
        await expect(store.delete('locale')).resolves.toBeUndefined()
      })

      it('should keep a tab in a value', async () => {
        const store = new VirtualCookieStore()

        await store.set('note', 'a\tb')

        expect(store.getSetCookieHeaders()).toEqual(['note=a\tb; Path=/'])
      })

      it('should take a request path that the URL parser reads as a host', async () => {
        const store = new VirtualCookieStore('theme=dark', '///')

        await expect(store.get({
          name: 'theme',
          url: 'http://localhost///'
        })).resolves.toEqual({
          name: 'theme',
          value: 'dark'
        })
      })

      it('should keep only the latest pending header per cookie identity', async () => {
        const store = new VirtualCookieStore()

        await store.set('theme', 'dark')
        await store.set('theme', 'light')
        await store.delete('theme')

        expect(store.getSetCookieHeaders()).toEqual([
          'theme=; Path=/; Max-Age=0'
        ])
      })
    })
  })
})
