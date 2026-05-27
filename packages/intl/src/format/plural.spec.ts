import {
  describe,
  expect,
  it
} from 'vitest'
import type { FormatContext } from '../types.js'
import { text } from './text.js'
import {
  match,
  cases
} from './match.js'
import {
  plural,
  forms
} from './plural.js'

const ctx = {
  $locale: () => 'en-US'
} as unknown as FormatContext

describe('intl', () => {
  describe('format', () => {
    describe('plural', () => {
      it('should select plural form by param value', () => {
        const format = plural('count', forms({
          one: text(),
          other: text()
        }))

        expect(format(ctx, {
          one: '{count} item',
          other: '{count} items'
        })({
          count: 1
        })).toBe('1 item')

        expect(format(ctx, {
          one: '{count} item',
          other: '{count} items'
        })({
          count: 2
        })).toBe('2 items')
      })

      it('should select input form without forms resolver', () => {
        const format = plural('count')

        expect(format(ctx, {
          one: '{count} item',
          other: '{count} items'
        })({
          count: 2
        })).toBe('2 items')
      })

      it('should select plural form by argument value', () => {
        const format = plural('count', forms({
          one: text(),
          other: text()
        }))

        expect(format(ctx, {
          one: '{count} item',
          other: '{count} items'
        })(2)).toBe('2 items')
      })

      it('should select input form by argument value without forms resolver', () => {
        const format = plural('count')

        expect(format(ctx, {
          one: '{count} item',
          other: '{count} items'
        })(2)).toBe('2 items')
      })

      it('should select input form with options without forms resolver', () => {
        const format = plural('place', {
          type: 'ordinal'
        })

        expect(format(ctx, {
          one: '{place}st',
          two: '{place}nd',
          few: '{place}rd',
          other: '{place}th'
        })({
          place: 2
        })).toBe('2nd')
      })

      it('should use exact numeric forms before plural rules', () => {
        const format = plural('count', forms({
          0: text(),
          one: text(),
          other: text()
        }))

        expect(format(ctx, {
          0: 'No items',
          one: '{count} item',
          other: '{count} items'
        })({
          count: 0
        })).toBe('No items')
      })

      it('should fallback to other form when selected form is missing', () => {
        const format = plural('count', forms({
          other: text()
        }))

        expect(format(ctx, {
          other: '{count} items'
        })({
          count: 1
        })).toBe('1 items')
      })

      it('should fallback to many form when other form is missing', () => {
        const format = plural('count', forms({
          many: text()
        }))

        expect(format(ctx, {
          many: '{count} items'
        })({
          count: 1
        })).toBe('1 items')
      })

      it('should use Intl.PluralRules options', () => {
        const format = plural(
          'place',
          {
            type: 'ordinal'
          },
          forms({
            one: text(),
            two: text(),
            few: text(),
            other: text()
          })
        )

        expect(format(ctx, {
          one: '{place}st',
          two: '{place}nd',
          few: '{place}rd',
          other: '{place}th'
        })({
          place: 2
        })).toBe('2nd')
      })

      it('should compose nested plural and select formatters', () => {
        const format = plural('count', forms({
          one: match('gender', cases({
            male: text('He has one task'),
            female: text('She has one task'),
            other: text('They have one task')
          })),
          other: match('gender', cases({
            male: text('He has {count} tasks'),
            female: text('She has {count} tasks'),
            other: text('They have {count} tasks')
          }))
        }))

        expect(format(ctx)({
          gender: 'male',
          count: 1
        })).toBe('He has one task')

        expect(format(ctx)({
          gender: 'female',
          count: 3
        })).toBe('She has 3 tasks')

        expect(format(ctx)({
          gender: 'other',
          count: 2
        })).toBe('They have 2 tasks')
      })

      it('should compose select cases and input plural without resolver', () => {
        const format = match('gender', cases({
          male: plural('count'),
          female: plural('count')
        }))

        expect(format(ctx, {
          male: {
            one: 'He has one task',
            other: 'He has {count} tasks'
          },
          female: {
            one: 'She has one task',
            other: 'She has {count} tasks'
          }
        })({
          gender: 'female',
          count: 3
        })).toBe('She has 3 tasks')
      })
    })
  })
})
