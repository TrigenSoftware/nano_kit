import {
  describe,
  expect,
  it
} from 'vitest'
import { signal } from '@nano_kit/store'
import type { FormatContext } from '../types.js'
import { format } from './format.js'
import { number } from './number.js'
import { text } from './text.js'

const ctx = {
  $locale: () => 'en-US'
} as unknown as FormatContext

describe('intl', () => {
  describe('format', () => {
    describe('format', () => {
      it('should create formatter values', () => {
        const formatNumber = format(number({
          maximumSignificantDigits: 3
        }))
        const formatter = formatNumber(ctx)

        expect(formatter(1234.567)).toBe('1,230')
      })

      it('should bind formatter values to current context', () => {
        const $locale = signal('en-US')
        const ctx = {
          $locale
        } as unknown as FormatContext
        const formatNumber = format(number())
        const formatter = formatNumber(ctx)

        expect(formatter(1234.5)).toBe('1,234.5')

        $locale('de-DE')

        expect(formatter(1234.5)).toBe('1.234,5')
      })

      it('should preserve wrapped format output type at runtime', () => {
        const formatText = format(text('Fallback'))
        const formatter = formatText(ctx)

        expect(formatter(undefined)).toBe('Fallback')
        expect(formatter('Hello')).toBe('Hello')
      })
    })
  })
})
