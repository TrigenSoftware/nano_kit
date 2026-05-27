import {
  describe,
  expect,
  it
} from 'vitest'
import type { FormatContext } from '../types.js'
import { number } from './number.js'
import {
  forms,
  plural
} from './plural.js'
import { text } from './text.js'
import { params } from './params.js'

const ctx = {
  $locale: () => 'en-US'
} as unknown as FormatContext

describe('intl', () => {
  describe('format', () => {
    describe('params', () => {
      it('should replace placeholders with formatted params', () => {
        const format = params({
          name: text(),
          count: number({
            style: 'unit',
            unit: 'day'
          })
        })

        expect(format(ctx, 'Hello {name}, {count} left')({
          name: 'Ada',
          count: 2
        })).toBe('Hello Ada, 2 days left')
      })

      it('should replace repeated placeholders', () => {
        const format = params({
          name: text()
        })

        expect(format(ctx, '{name}, {name}!')({
          name: 'Ada'
        })).toBe('Ada, Ada!')
      })

      it('should use param formatter fallbacks', () => {
        const format = params({
          name: text('Guest')
        })

        expect(format(ctx, 'Hello {name}')({})).toBe('Hello Guest')
      })

      it('should read accessor params', () => {
        const format = params({
          name: text()
        })

        expect(format(ctx, 'Hello {name}')({
          name: () => 'Ada'
        })).toBe('Hello Ada')
      })

      it('should return undefined for empty input', () => {
        const format = params({
          name: text()
        })

        expect(format(ctx)({
          name: 'Ada'
        })).toBeUndefined()
      })

      it('should apply preformat before replacing placeholders', () => {
        const format = params(
          {
            name: text()
          },
          text('Hello {name}')
        )

        expect(format(ctx)({
          name: 'Ada'
        })).toBe('Hello Ada')
      })

      it('should apply preformatted param functions', () => {
        const format = params(
          {
            name: text()
          },
          () => params => `Hello {name}, ${String(params.name)}`
        )

        expect(format(ctx, undefined)({
          name: 'Ada'
        })).toBe('Hello Ada, Ada')
      })

      it('should compose with plural formatters', () => {
        const format = params(
          {
            name: text()
          },
          plural('count', forms({
            one: text(),
            other: text()
          }))
        )

        expect(format(ctx, {
          one: '{name} has {count} message',
          other: '{name} has {count} messages'
        })({
          name: 'Ada',
          count: 2
        })).toBe('Ada has 2 messages')
      })
    })
  })
})
