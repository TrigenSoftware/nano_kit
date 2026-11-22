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
import { number } from './number.js'
import { params } from './params.js'
import { plural } from './plural.js'

const ctx: FormatContext = {
  $locale: () => 'en-US'
}

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

      it('should transform the text of a message function', () => {
        const upper = uppercase(params({
          name: text()
        }))
        const lower = lowercase(params({
          count: number()
        }, plural('count')))
        const capital = capitalize(params({
          name: text()
        }))

        expect(upper(ctx, 'Hello {name}')({
          name: 'Ada'
        })).toBe('HELLO ADA')
        expect(lower(ctx, {
          one: '{count} ITEM',
          other: '{count} ITEMS'
        })({
          count: 1284
        })).toBe('1,284 items')
        expect(capital(ctx, '{name} joined')({
          name: 'ada'
        })).toBe('Ada joined')
      })

      it('should preserve undefined text of a message function', () => {
        const format = capitalize(params({
          name: text()
        }))

        expect(format(ctx)({
          name: 'Ada'
        })).toBeUndefined()
      })
    })
  })
})
