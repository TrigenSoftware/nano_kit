import { describe, expect, it } from 'vitest'
import {
  parseCookie,
  serializeDeleteCookie,
  serializeSetCookie
} from './raw.js'

describe('cookie-store', () => {
  describe('raw', () => {
    describe('parseCookie', () => {
      it('should parse a cookie header into name/value pairs', () => {
        expect(parseCookie('theme=dark; session=abc123')).toEqual([
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

      it('should ignore empty cookie segments', () => {
        expect(parseCookie(' theme=dark ; ; session=abc123 ; ')).toEqual([
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

      it('should handle cookie segments without an equals sign', () => {
        expect(parseCookie('feature; theme=dark')).toEqual([
          {
            name: 'feature',
            value: ''
          },
          {
            name: 'theme',
            value: 'dark'
          }
        ])
      })
    })

    describe('serializeSetCookie', () => {
      it('should serialize a cookie entry into a set-cookie header value', () => {
        expect(serializeSetCookie({
          knownScope: true,
          name: 'theme',
          value: 'dark',
          domain: 'example.com',
          expires: 0,
          maxAge: 60,
          partitioned: true,
          path: '/app',
          sameSite: 'lax',
          secure: true
        })).toBe(
          'theme=dark; Domain=example.com; Path=/app; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=60; SameSite=Lax; Secure; Partitioned'
        )
      })
    })

    describe('serializeDeleteCookie', () => {
      it('should serialize a cookie deletion header value', () => {
        expect(serializeDeleteCookie({
          knownScope: true,
          name: 'theme',
          value: '',
          domain: 'example.com',
          expires: 0,
          maxAge: 0,
          partitioned: true,
          path: '/app',
          secure: false
        })).toBe(
          'theme=; Domain=example.com; Path=/app; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; Partitioned'
        )
      })
    })
  })
})
