import {
  describe,
  expect,
  it
} from 'vitest'
import type { FormatContext } from '../types.js'
import {
  capitalize,
  lowercase,
  text,
  uppercase
} from './text.js'

const ctx = {
  $locale: () => 'en-US'
} as unknown as FormatContext

describe('intl', () => {
  describe('format', () => {
    describe('text', () => {
      it('should return text input', () => {
        const format = text()

        expect(format(ctx, 'Hello')).toBe('Hello')
      })

      it('should return fallback for empty input', () => {
        const format = text('Fallback')

        expect(format(ctx)).toBe('Fallback')
      })

      it('should return undefined without fallback', () => {
        const format = text()

        expect(format(ctx)).toBeUndefined()
      })

      it('should uppercase text formatter output', () => {
        const format = uppercase(text())

        expect(format(ctx, 'Hello')).toBe('HELLO')
      })

      it('should lowercase text formatter output', () => {
        const format = lowercase(text())

        expect(format(ctx, 'Hello')).toBe('hello')
      })

      it('should capitalize text formatter output', () => {
        const format = capitalize(text())

        expect(format(ctx, 'hello')).toBe('Hello')
      })

      it('should preserve undefined transformed output', () => {
        const format = capitalize(text())

        expect(format(ctx)).toBeUndefined()
      })
    })
  })
})
