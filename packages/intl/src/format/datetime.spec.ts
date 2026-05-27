import {
  describe,
  expect,
  it
} from 'vitest'
import type { FormatContext } from '../types.js'
import { datetime } from './datetime.js'

const ctx = {
  $locale: () => 'en-US'
} as unknown as FormatContext
const date = new Date('2024-01-02T00:00:00.000Z')

describe('intl', () => {
  describe('format', () => {
    describe('datetime', () => {
      it('should format dates using current locale', () => {
        const format = datetime({
          timeZone: 'UTC',
          dateStyle: 'medium'
        })

        expect(format(ctx, date)).toBe('Jan 2, 2024')
      })

      it('should return undefined for empty input without fallback', () => {
        const format = datetime()

        expect(format(ctx)).toBeUndefined()
      })

      it('should format timestamps with Intl.DateTimeFormat options', () => {
        const format = datetime({
          timeZone: 'UTC',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })

        expect(format(ctx, Date.UTC(2024, 0, 2))).toBe('01/02/2024')
      })

      it('should return raw values when options are disabled', () => {
        const format = datetime(false)

        expect(format(ctx, date)).toBe(date)
      })

      it('should return raw fallback when options are disabled', () => {
        const format = datetime(date, false)

        expect(format(ctx)).toBe(date)
      })

      it('should format fallback values', () => {
        const format = datetime(date, {
          timeZone: 'UTC',
          dateStyle: 'medium'
        })

        expect(format(ctx)).toBe('Jan 2, 2024')
      })
    })
  })
})
