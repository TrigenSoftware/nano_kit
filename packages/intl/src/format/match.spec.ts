import {
  describe,
  expect,
  it
} from 'vitest'
import type { FormatContext } from '../types.js'
import { text } from './text.js'
import {
  plural,
  forms
} from './plural.js'
import {
  cases,
  match
} from './match.js'

const ctx = {
  $locale: () => 'en-US'
} as unknown as FormatContext

describe('intl', () => {
  describe('format', () => {
    describe('match', () => {
      it('should select case by param value', () => {
        const format = match('gender', cases({
          male: text(),
          female: text()
        }))

        expect(format(ctx, {
          male: 'He invited {gender}.',
          female: 'She invited {gender}.'
        })({
          gender: 'female'
        })).toBe('She invited female.')
      })

      it('should select input case without cases resolver', () => {
        const format = match('gender')

        expect(format(ctx, {
          male: 'He invited {gender}.',
          female: 'She invited {gender}.'
        })({
          gender: 'female'
        })).toBe('She invited female.')
      })

      it('should select case by argument value', () => {
        const format = match('gender', cases({
          male: text(),
          female: text()
        }))

        expect(format(ctx, {
          male: 'He invited {gender}.',
          female: 'She invited {gender}.'
        })('female')).toBe('She invited female.')
      })

      it('should select input case by argument value without cases resolver', () => {
        const format = match('gender')

        expect(format(ctx, {
          male: 'He invited {gender}.',
          female: 'She invited {gender}.'
        })('female')).toBe('She invited female.')
      })

      it('should use case formatter fallbacks', () => {
        const format = match('status', cases({
          active: text('Active {status}'),
          disabled: text('Disabled {status}')
        }))

        expect(format(ctx)({
          status: 'active'
        })).toBe('Active active')
      })

      it('should return undefined for missing case', () => {
        const format = match('status', cases({
          active: text()
        }))

        expect(format(ctx, {
          active: 'Active'
        })({
          status: 'disabled'
        })).toBeUndefined()
      })

      it('should resolve case key with custom resolver', () => {
        const format = match(
          'role',
          cases({
            admin: text(),
            user: text()
          }),
          role => (role === 'admin' ? 'admin' : 'user')
        )

        expect(format(ctx, {
          admin: 'Admin area',
          user: 'User area'
        })({
          role: 'guest'
        })).toBe('User area')
      })

      it('should pass locale to custom resolver', () => {
        const format = match(
          'case',
          cases({
            en: text(),
            other: text()
          }),
          (_value, locale) => (locale.startsWith('en') ? 'en' : 'other')
        )

        expect(format(ctx, {
          en: 'English',
          other: 'Other'
        })({
          case: 'ignored'
        })).toBe('English')
      })

      it('should compose nested select and plural formatters', () => {
        const format = match('gender', cases({
          male: plural('count', forms({
            one: text('He has one task'),
            other: text('He has {count} tasks')
          })),
          female: plural('count', forms({
            one: text('She has one task'),
            other: text('She has {count} tasks')
          })),
          other: plural('count', forms({
            one: text('They have one task'),
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

      it('should compose plural forms and input select without resolver', () => {
        const format = plural('count', forms({
          one: match('gender'),
          other: match('gender')
        }))

        expect(format(ctx, {
          one: {
            male: 'He has one task',
            female: 'She has one task'
          },
          other: {
            male: 'He has {count} tasks',
            female: 'She has {count} tasks'
          }
        })({
          gender: 'female',
          count: 3
        })).toBe('She has 3 tasks')
      })
    })
  })
})
