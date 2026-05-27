import {
  describe,
  expect,
  it
} from 'vitest'
import type { FormatContext } from '../types.js'
import { number } from './number.js'

const ctx = {
  $locale: () => 'en-US'
} as unknown as FormatContext

describe('intl', () => {
  describe('format', () => {
    describe('number', () => {
      it('should format numbers using current locale', () => {
        const format = number()

        expect(format(ctx, 1234.5)).toBe('1,234.5')
      })

      it('should return undefined for empty input without fallback', () => {
        const format = number()

        expect(format(ctx)).toBeUndefined()
      })

      it('should format numbers with Intl.NumberFormat options', () => {
        const format = number({
          style: 'currency',
          currency: 'USD'
        })

        expect(format(ctx, 12)).toBe('$12.00')
      })

      it('should return raw values when options are disabled', () => {
        const format = number(false)

        expect(format(ctx, 1234.5)).toBe(1234.5)
      })

      it('should return raw fallback when options are disabled', () => {
        const format = number(42, false)

        expect(format(ctx)).toBe(42)
      })

      it('should format fallback values', () => {
        const format = number(42, {
          minimumFractionDigits: 2
        })

        expect(format(ctx)).toBe('42.00')
      })
    })
  })
})
