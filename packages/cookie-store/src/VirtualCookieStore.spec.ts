import { describe, expect, it } from 'vitest'
import { VirtualCookieStore } from './VirtualCookieStore.js'

describe('cookie-store', () => {
  describe('VirtualCookieStore', () => {
    it('should read cookies from a request header', async () => {
      const store = new VirtualCookieStore('theme=dark; session=abc123')

      expect(store.peek('theme')).toEqual({
        name: 'theme',
        value: 'dark'
      })
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
        'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0'
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
        'theme=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0'
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

    it('should keep only the latest pending header per cookie identity', async () => {
      const store = new VirtualCookieStore()

      await store.set('theme', 'dark')
      await store.set('theme', 'light')
      await store.delete('theme')

      expect(store.getSetCookieHeaders()).toEqual([
        'theme=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0'
      ])
    })
  })
})
