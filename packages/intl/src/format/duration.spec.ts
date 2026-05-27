import {
  describe,
  expect,
  it
} from 'vitest'
import type { FormatContext } from '../types.js'
import { duration } from './duration.js'

const ctx = {
  $locale: () => 'en-US'
} as unknown as FormatContext
const value = {
  hours: 1,
  minutes: 30
}

describe('intl', () => {
  describe('format', () => {
    describe('duration', () => {
      it('should format durations using current locale', () => {
        const format = duration()

        expect(format(ctx, value)).toBe('1 hr, 30 min')
      })

      it('should return undefined for empty input without fallback', () => {
        const format = duration()

        expect(format(ctx)).toBeUndefined()
      })

      it('should format durations with Intl.DurationFormat options', () => {
        const format = duration({
          style: 'long'
        })

        expect(format(ctx, value)).toBe('1 hour, 30 minutes')
      })

      it('should return raw values when options are disabled', () => {
        const format = duration(false)

        expect(format(ctx, value)).toBe(value)
      })

      it('should return raw fallback when options are disabled', () => {
        const format = duration(value, false)

        expect(format(ctx)).toBe(value)
      })

      it('should format fallback values', () => {
        const format = duration(value, {
          style: 'long'
        })

        expect(format(ctx)).toBe('1 hour, 30 minutes')
      })
    })
  })
})
