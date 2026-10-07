import {
  describe,
  expect,
  it
} from 'vitest'
import {
  computed,
  signal
} from '@nano_kit/store'
import type { FormatContext } from '../types.js'
import { relativetime } from './relativetime.js'

const ctx: FormatContext = {
  $locale: () => 'en-US'
}
const now = Date.parse('2026-10-07T12:00:00.000Z')
const minute = 60_000
const hour = 60 * minute
const day = 24 * hour

describe('intl', () => {
  describe('format', () => {
    describe('relativetime', () => {
      it('should format in the largest unit the distance fills', () => {
        const format = relativetime({
          relativeTo: now
        })

        expect(format(ctx, now - 20_000)).toBe('20 seconds ago')
        expect(format(ctx, now - 5 * minute)).toBe('5 minutes ago')
        expect(format(ctx, now - 23 * hour)).toBe('23 hours ago')
        expect(format(ctx, now - 10 * day)).toBe('1 week ago')
        expect(format(ctx, now + 3 * day + hour)).toBe('in 3 days')
      })

      it('should format with Intl.RelativeTimeFormat options', () => {
        const format = relativetime({
          numeric: 'auto',
          relativeTo: now
        })

        expect(format(ctx, now - 30 * hour)).toBe('yesterday')
      })

      it('should not format in a unit larger than largestUnit', () => {
        const format = relativetime({
          largestUnit: 'day',
          relativeTo: now
        })

        expect(format(ctx, now - 400 * day)).toBe('400 days ago')
      })

      it('should format in one unit when largestUnit and smallestUnit match', () => {
        const format = relativetime({
          largestUnit: 'hour',
          smallestUnit: 'hour',
          relativeTo: now
        })

        expect(format(ctx, now - 3 * day)).toBe('72 hours ago')
        expect(format(ctx, now - 90 * minute)).toBe('1 hour ago')
      })

      it('should read zero of a time unit as now', () => {
        const format = relativetime({
          numeric: 'auto',
          smallestUnit: 'minute',
          relativeTo: now
        })

        expect(format(ctx, now - 20_000)).toBe('now')
      })

      it('should read zero of a calendar unit in that unit', () => {
        const format = relativetime({
          numeric: 'auto',
          smallestUnit: 'day',
          relativeTo: now
        })

        expect(format(ctx, now - 5 * hour)).toBe('today')
      })

      it('should format dates and date strings', () => {
        const format = relativetime({
          relativeTo: new Date(now)
        })
        const date = new Date(now - 5 * minute)

        expect(format(ctx, date)).toBe('5 minutes ago')
        expect(format(ctx, date.toISOString())).toBe('5 minutes ago')
      })

      it('should count from the current time by default', () => {
        const format = relativetime()

        expect(format(ctx, Date.now() - 5 * minute)).toBe('5 minutes ago')
      })

      it('should follow a signal passed as relativeTo', () => {
        const $now = signal(now)
        const format = relativetime({
          relativeTo: $now
        })
        const $time = computed(() => format(ctx, now - 5 * minute))

        expect($time()).toBe('5 minutes ago')

        $now(now + 55 * minute)

        expect($time()).toBe('1 hour ago')
      })

      it('should return undefined for empty input without fallback', () => {
        const format = relativetime({
          relativeTo: now
        })

        expect(format(ctx)).toBeUndefined()
      })

      it('should return raw values when options are disabled', () => {
        const format = relativetime(false)

        expect(format(ctx, now)).toBe(now)
      })

      it('should return raw fallback when options are disabled', () => {
        const format = relativetime(now, false)

        expect(format(ctx)).toBe(now)
      })

      it('should format fallback values', () => {
        const format = relativetime(now - day, {
          relativeTo: now
        })

        expect(format(ctx)).toBe('1 day ago')
      })
    })
  })
})
