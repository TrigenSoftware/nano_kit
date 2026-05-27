import {
  describe,
  expect,
  it
} from 'vitest'
import type { FormatContext } from '../types.js'
import { relativetime } from './relativetime.js'

const ctx = {
  $locale: () => 'en-US'
} as unknown as FormatContext

describe('intl', () => {
  describe('format', () => {
    describe('relativetime', () => {
      it('should format relative time using current locale', () => {
        const format = relativetime({
          unit: 'day'
        })

        expect(format(ctx, -1)).toBe('1 day ago')
      })

      it('should return undefined for empty input without fallback', () => {
        const format = relativetime({
          unit: 'day'
        })

        expect(format(ctx)).toBeUndefined()
      })

      it('should format relative time with Intl.RelativeTimeFormat options', () => {
        const format = relativetime({
          unit: 'day',
          numeric: 'auto'
        })

        expect(format(ctx, -1)).toBe('yesterday')
      })

      it('should return raw values when options are disabled', () => {
        const format = relativetime(false)

        expect(format(ctx, -1)).toBe(-1)
      })

      it('should return raw fallback when options are disabled', () => {
        const format = relativetime(-1, false)

        expect(format(ctx)).toBe(-1)
      })

      it('should format fallback values', () => {
        const format = relativetime(-1, {
          unit: 'day'
        })

        expect(format(ctx)).toBe('1 day ago')
      })
    })
  })
})
