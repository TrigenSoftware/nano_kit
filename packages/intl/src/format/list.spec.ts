import {
  describe,
  expect,
  it
} from 'vitest'
import type { FormatContext } from '../types.js'
import { list } from './list.js'

const ctx = {
  $locale: () => 'en-US'
} as unknown as FormatContext
const value = ['red', 'green', 'blue']

describe('intl', () => {
  describe('format', () => {
    describe('list', () => {
      it('should format lists using current locale', () => {
        const format = list()

        expect(format(ctx, value)).toBe('red, green, and blue')
      })

      it('should return undefined for empty input without fallback', () => {
        const format = list()

        expect(format(ctx)).toBeUndefined()
      })

      it('should format lists with Intl.ListFormat options', () => {
        const format = list({
          type: 'disjunction'
        })

        expect(format(ctx, value)).toBe('red, green, or blue')
      })

      it('should return raw values when options are disabled', () => {
        const format = list(false)

        expect(format(ctx, value)).toBe(value)
      })

      it('should return raw fallback when options are disabled', () => {
        const format = list(value, false)

        expect(format(ctx)).toBe(value)
      })

      it('should format fallback values', () => {
        const format = list(value, {
          type: 'disjunction'
        })

        expect(format(ctx)).toBe('red, green, or blue')
      })
    })
  })
})
