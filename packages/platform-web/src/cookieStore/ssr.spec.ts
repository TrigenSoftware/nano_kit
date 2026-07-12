import {
  describe,
  expect,
  it
} from 'vitest'
import { VirtualCookieStore } from './VirtualCookieStore.js'
import { serializeCookies } from './ssr.js'

describe('platform-web', () => {
  describe('cookieStore', () => {
    describe('serializeCookies', () => {
      it('should serialize cookies into a request header value', async () => {
        const store = new VirtualCookieStore('theme=dark; session=abc123; locale=en')

        await expect(serializeCookies(store, ['theme', 'session'])).resolves.toBe(
          'theme=dark; session=abc123'
        )
      })

      it('should skip missing cookies', async () => {
        const store = new VirtualCookieStore('theme=dark')

        await expect(serializeCookies(store, [
          'theme',
          'session',
          'locale'
        ])).resolves.toBe('theme=dark')
      })

      it('should serialize missing cookies to an empty string', async () => {
        const store = new VirtualCookieStore('')

        await expect(serializeCookies(store, ['theme'])).resolves.toBe('')
      })
    })
  })
})
