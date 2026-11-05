import {
  describe,
  expect,
  it
} from 'vitest'
import { signal } from '@nano_kit/store'
import type { FormatContext } from '../types.js'
import { choose } from './choose.js'
import { datetime } from './datetime.js'
import { relativetime } from './relativetime.js'

const ctx: FormatContext = {
  $locale: () => 'en-US'
}
const minute = 60 * 1000
const hour = 60 * minute
const now = new Date('2024-06-15T12:00:00.000Z').getTime()
const formats = {
  time: relativetime({
    relativeTo: new Date(now),
    numeric: 'auto',
    smallestUnit: 'minute'
  }),
  year: datetime({
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  })
}

describe('intl', () => {
  describe('format', () => {
    describe('choose', () => {
      it('should render a value with the format the function calls', () => {
        const message = choose(formats, (t, date: Date) => (now - date.getTime() < hour ? t.time(date) : t.year(date)))(ctx)

        expect(message(new Date(now - 5 * minute))).toBe('5 minutes ago')
        expect(message(new Date('2020-03-04T00:00:00.000Z'))).toBe('Mar 4, 2020')
      })

      it('should read a value passed as a signal', () => {
        const message = choose(formats, (t, date: Date) => t.year(date))(ctx)
        const $date = signal(new Date('2020-03-04T00:00:00.000Z'))

        expect(message($date)).toBe('Mar 4, 2020')
      })

      it('should read each value of a plain object', () => {
        const message = choose(formats, (t, values: {
          at: Date
          prefix: string
        }) => `${values.prefix} ${t.year(values.at)}`)(ctx)

        expect(message({
          at: signal(new Date('2020-03-04T00:00:00.000Z')),
          prefix: 'Since'
        })).toBe('Since Mar 4, 2020')
      })

      it('should take the values of the formats by default', () => {
        const message = choose(formats, (t, value) => t.year(value))(ctx)

        expect(message(Date.UTC(2020, 2, 4))).toBe('Mar 4, 2020')
        expect(message(null)).toBeUndefined()
      })

      it('should pass the active locale', () => {
        const message = choose(formats, (t, value, locale) => `${t.year(value)} ${locale}`)(ctx)

        expect(message(Date.UTC(2020, 2, 4))).toBe('Mar 4, 2020 en-US')
      })
    })
  })
})
