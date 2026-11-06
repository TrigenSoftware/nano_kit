import {
  vi,
  describe,
  expect,
  it
} from 'vitest'
import type { FormatContext } from '../types.js'
import {
  cases,
  match
} from './match.js'
import { number } from './number.js'
import {
  forms,
  plural
} from './plural.js'
import { text } from './text.js'
import { params } from './params.js'

const ctx: FormatContext = {
  $locale: () => 'en-US'
}

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

      it('should fill in the param of a plural formatter', () => {
        const format = params({
          count: number()
        }, plural('count'))

        expect(format(ctx, {
          one: '{count} item',
          other: '{count} items'
        })({
          count: 1284
        })).toBe('1,284 items')
      })

      it('should select a plural form by the raw value of the param', () => {
        const format = params({
          count: number({
            minimumFractionDigits: 1
          })
        }, plural('count'))

        expect(format(ctx, {
          one: '{count} item',
          other: '{count} items'
        })({
          count: 1
        })).toBe('1.0 item')
      })

      it('should leave a param it does not list to a plural formatter', () => {
        const format = params({
          name: text()
        }, plural('count'))

        expect(format(ctx, {
          other: '{name} has {count}'
        })({
          name: 'Ada',
          count: 1284
        })).toBe('Ada has 1284')
      })

      it('should fill in the param of a plain string translation', () => {
        const format = params({
          count: number()
        }, plural('count'))

        expect(format(ctx, '{count} items')({
          count: 1284
        })).toBe('1,284 items')
      })

      it('should fill in the param of plural forms', () => {
        const format = params({
          count: number()
        }, plural('count', forms({
          one: text('{count} item'),
          other: text('{count} items')
        })))

        expect(format(ctx)({
          count: 1284
        })).toBe('1,284 items')
      })

      it('should fill in the param of a plural formatter in nested cases', () => {
        const format = params({
          count: number()
        }, match('gender', cases({
          male: plural('count'),
          female: plural('count')
        })))

        expect(format(ctx, {
          female: {
            other: 'She has {count} items'
          }
        })({
          gender: 'female',
          count: 1284
        })).toBe('She has 1,284 items')
      })

      it('should fill in the param of a match formatter', () => {
        const format = params({
          status: text()
        }, match('status'))

        expect(format(ctx, {
          active: '{status} account'
        })({
          status: 'active'
        })).toBe('active account')
      })

      it('should warn about a param without a value', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const format = params({
          name: text()
        })

        expect(format(ctx, 'Hello {name}')({
          name: undefined
        })).toBe('Hello undefined')
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('"name"'))
        warn.mockRestore()
      })

      it('should not warn about a param without a placeholder', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const format = params({
          name: text()
        })

        expect(format(ctx, 'Hello')({
          name: undefined
        })).toBe('Hello')
        expect(warn).not.toHaveBeenCalled()
        warn.mockRestore()
      })
    })
  })
})
