import {
  describe,
  expect,
  it
} from 'vitest'
import type { FormatContext } from '../types.js'
import {
  mapTags,
  rich
} from './rich.js'

const ctx = {} as FormatContext

interface Node {
  type: string
  children: unknown[]
}

const tags = {
  link: (chunks: (string | Node)[]) => ({
    type: 'link',
    children: chunks
  }),
  strong: (chunks: (string | Node)[]) => ({
    type: 'strong',
    children: chunks
  })
}

describe('intl', () => {
  describe('format', () => {
    describe('rich', () => {
      it('should map rich tags to chunks', () => {
        const format = rich(tags)

        expect(format(ctx, 'Read <link>guidelines</link>.')).toEqual([
          'Read ',
          {
            type: 'link',
            children: ['guidelines']
          },
          '.'
        ])
      })

      it('should return undefined for empty input without fallback', () => {
        const format = rich(tags)

        expect(format(ctx)).toBeUndefined()
      })

      it('should map fallback messages', () => {
        const format = rich('Read <link>guidelines</link>.', tags)

        expect(format(ctx)).toEqual([
          'Read ',
          {
            type: 'link',
            children: ['guidelines']
          },
          '.'
        ])
      })

      it('should map nested rich tags', () => {
        const format = rich(tags)

        expect(format(ctx, '<link>Read <strong>this</strong></link>')).toEqual([
          {
            type: 'link',
            children: [
              'Read ',
              {
                type: 'strong',
                children: ['this']
              }
            ]
          }
        ])
      })

      it('should ignore unknown tags and keep text content', () => {
        expect(mapTags('Read <unknown>guidelines</unknown>.', tags)).toEqual([
          'Read ',
          'guidelines',
          '.'
        ])
      })

      it('should ignore malformed known tags and keep text content', () => {
        expect(mapTags('Read <link>guidelines.', tags)).toEqual([
          'Read ',
          'guidelines.'
        ])
      })
    })
  })
})
