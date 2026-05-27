import {
  describe,
  expect,
  it
} from 'vitest'
import type { FormatContext } from '../types.js'
import { datetime } from './datetime.js'
import { number } from './number.js'
import { range } from './range.js'

const ctx = {
  $locale: () => 'en-US'
} as unknown as FormatContext
const from = new Date('2024-01-02T00:00:00.000Z')
const to = new Date('2024-01-05T00:00:00.000Z')
const value = [from, to] as const

describe('intl', () => {
  describe('format', () => {
    describe('range', () => {
      it('should format ranges using formatter factory', () => {
        const format = range(datetime, {
          timeZone: 'UTC',
          dateStyle: 'medium'
        })

        expect(format(ctx, value)).toBe('Jan 2 – 5, 2024')
      })

      it('should return undefined for empty input without fallback', () => {
        const format = range(datetime, {
          timeZone: 'UTC',
          dateStyle: 'medium'
        })

        expect(format(ctx)).toBeUndefined()
      })

      it('should return raw ranges when options are disabled', () => {
        const format = range(datetime, false)

        expect(format(ctx, value)).toBe(value)
      })

      it('should return raw fallback when options are disabled', () => {
        const format = range(datetime, value, false)

        expect(format(ctx)).toBe(value)
      })

      it('should format fallback ranges', () => {
        const format = range(datetime, value, {
          timeZone: 'UTC',
          dateStyle: 'medium'
        })

        expect(format(ctx)).toBe('Jan 2 – 5, 2024')
      })

      it('should format number ranges', () => {
        const format = range(number)

        expect(format(ctx, [1, 5])).toBe('1–5')
      })

      it('should format number ranges with options', () => {
        const format = range(number, {
          style: 'currency',
          currency: 'USD'
        })

        expect(format(ctx, [1, 5])).toBe('$1.00 – $5.00')
      })
    })
  })
})
