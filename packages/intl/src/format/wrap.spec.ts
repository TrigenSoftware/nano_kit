import {
  vi,
  describe,
  expect,
  it
} from 'vitest'
import type { FormatContext } from '../types.js'
import { datetime } from './datetime.js'
import { format } from './format.js'
import {
  forms,
  plural
} from './plural.js'
import { params } from './params.js'
import { text } from './text.js'
import { wrap } from './wrap.js'

const ctx: FormatContext = {
  $locale: () => 'en-US'
}
const trCtx: FormatContext = {
  $locale: () => 'tr'
}

describe('intl', () => {
  describe('format', () => {
    describe('wrap', () => {
      describe('message function', () => {
        const place = wrap(params({
          city: text(),
          country: text()
        }), (values, message) => (values.city && values.country ? message(values) : values.city || values.country))

        it('should render the wrapped message when the function calls it', () => {
          expect(place(ctx, '{city}, {country}')({
            city: 'Kyoto',
            country: 'Japan'
          })).toBe('Kyoto, Japan')
        })

        it('should render what the function returns instead of the wrapped message', () => {
          expect(place(ctx, '{city}, {country}')({
            city: 'Kyoto',
            country: ''
          })).toBe('Kyoto')
        })

        it('should pass values read from accessors', () => {
          expect(place(ctx, '{city}, {country}')({
            city: () => '',
            country: () => 'Japan'
          })).toBe('Japan')
        })

        it('should not replace placeholders in a returned value', () => {
          expect(place(ctx, '{city}, {country}')({
            city: 'Lyon {country}',
            country: ''
          })).toBe('Lyon {country}')
        })

        it('should not render the wrapped message unless the function calls it', () => {
          const message = vi.fn(() => 'Hello')
          const format = wrap(() => message, () => 'Bye')

          expect(format(ctx)({})).toBe('Bye')
          expect(message).not.toHaveBeenCalled()
        })

        it('should render the wrapped message with values the function passes', () => {
          const format = wrap(params({
            city: text()
          }), (values, message) => message({
            city: values.city?.trim()
          }))

          expect(format(ctx, 'in {city}')({
            city: '  Kyoto  '
          })).toBe('in Kyoto')
        })

        it('should pass the value of a call made with the value itself', () => {
          const format = wrap(plural('count'), (count, message) => (count ? message(count) : undefined))
          const message = format(ctx, {
            one: '{count} view',
            other: '{count} views'
          })

          expect(message(2)).toBe('2 views')
          expect(message(0)).toBeUndefined()
        })

        it('should wrap a message composed with plural', () => {
          const format = wrap(params({
            name: text()
          }, plural('count', forms({
            one: text(),
            other: text()
          }))), (values, message) => message(values))

          expect(format(ctx, {
            one: '{name} has {count} plant',
            other: '{name} has {count} plants'
          })({
            name: 'Ada',
            count: 2
          })).toBe('Ada has 2 plants')
        })

        it('should pass the active locale', () => {
          const format = wrap(params({
            city: text()
          }), (values, message, locale) => message(values)?.toLocaleUpperCase(locale))

          expect(format(trCtx, '{city}')({
            city: 'izmir'
          })).toBe('İZMİR')
        })
      })

      describe('value', () => {
        it('should pass the formatted value as is with the active locale', () => {
          const format = wrap(text(), (message, locale) => message?.toLocaleUpperCase(locale))

          expect(format(trCtx, 'izmir')).toBe('İZMİR')
        })

        it('should wrap a format of a callable message', () => {
          const formatDate = format(wrap(datetime({
            dateStyle: 'medium',
            timeZone: 'UTC'
          }), (message, locale) => message?.toLocaleUpperCase(locale)))

          expect(formatDate(ctx)(new Date('2024-01-02T00:00:00.000Z'))).toBe('JAN 2, 2024')
        })
      })
    })
  })
})
