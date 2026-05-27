import {
  describe,
  expect,
  it
} from 'vitest'
import type { FormatContext } from '../types.js'
import { markup } from './markup.js'

const ctx = {} as FormatContext
const tags = {
  link: (chunks: string) => `<a>${chunks}</a>`,
  strong: (chunks: string) => `<strong>${chunks}</strong>`
}

describe('intl', () => {
  describe('format', () => {
    describe('markup', () => {
      it('should map markup tags to strings', () => {
        const format = markup(tags)

        expect(format(ctx, 'Read <link>guidelines</link>.')).toBe(
          'Read <a>guidelines</a>.'
        )
      })

      it('should return undefined for empty input without fallback', () => {
        const format = markup(tags)

        expect(format(ctx)).toBeUndefined()
      })

      it('should map fallback messages', () => {
        const format = markup('Read <link>guidelines</link>.', tags)

        expect(format(ctx)).toBe('Read <a>guidelines</a>.')
      })

      it('should map nested markup tags', () => {
        const format = markup(tags)

        expect(format(ctx, '<link>Read <strong>this</strong></link>')).toBe(
          '<a>Read <strong>this</strong></a>'
        )
      })

      it('should ignore unknown tags and keep text content', () => {
        const format = markup(tags)

        expect(format(ctx, 'Read <unknown>guidelines</unknown>.')).toBe(
          'Read guidelines.'
        )
      })

      it('should ignore malformed known tags and keep text content', () => {
        const format = markup(tags)

        expect(format(ctx, 'Read <link>guidelines.')).toBe('Read guidelines.')
      })
    })
  })
})
