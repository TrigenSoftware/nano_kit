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
import { params } from './params.js'
import { text } from './text.js'

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
  }),
  br: () => ({
    type: 'br',
    children: []
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

      it('should map self-closing tags', () => {
        expect(mapTags('First line<br/>second line', tags)).toEqual([
          'First line',
          {
            type: 'br',
            children: []
          },
          'second line'
        ])
        expect(mapTags('First line<br />second line', tags)).toEqual([
          'First line',
          {
            type: 'br',
            children: []
          },
          'second line'
        ])
      })

      it('should map self-closing tags inside other tags', () => {
        expect(mapTags('<strong>First<br/>second</strong>', tags)).toEqual([
          {
            type: 'strong',
            children: [
              'First',
              {
                type: 'br',
                children: []
              },
              'second'
            ]
          }
        ])
      })

      it('should ignore unknown self-closing tags', () => {
        expect(mapTags('First<hr/>second', tags)).toEqual([
          'First',
          'second'
        ])
      })

      it('should support nested calls in tag handlers', () => {
        const nestedTags = {
          ...tags,
          wrap: (chunks: (string | Node)[]) => ({
            type: 'wrap',
            children: [...chunks, ...mapTags('<strong>inner</strong>', tags)]
          })
        }

        expect(mapTags('<wrap>outer</wrap> and <strong>after</strong>', nestedTags)).toEqual([
          {
            type: 'wrap',
            children: [
              'outer',
              {
                type: 'strong',
                children: ['inner']
              }
            ]
          },
          ' and ',
          {
            type: 'strong',
            children: ['after']
          }
        ])
      })

      it('should pass unique index to tag handlers', () => {
        const indexedTags = {
          strong: (chunks: unknown[], index: number) => ({
            type: 'strong',
            index,
            children: chunks
          }),
          br: (_: unknown[], index: number) => ({
            type: 'br',
            index,
            children: []
          })
        }

        expect(mapTags('<strong>First</strong><br/><strong>second</strong>', indexedTags)).toEqual([
          {
            type: 'strong',
            index: 0,
            children: ['First']
          },
          {
            type: 'br',
            index: 1,
            children: []
          },
          {
            type: 'strong',
            index: 2,
            children: ['second']
          }
        ])
      })

      it('should format text pieces with the given formatter', () => {
        expect(mapTags('Read <link>guidelines</link>.', tags, piece => piece.toUpperCase())).toEqual([
          'READ ',
          {
            type: 'link',
            children: ['GUIDELINES']
          },
          '.'
        ])
      })

      it('should format each text piece with the preformat', () => {
        const format = rich(tags, params({
          name: text(),
          count: text()
        }))

        expect(format(ctx, '<strong>{name}</strong> leads with {count}')({
          name: 'Rosa',
          count: '3'
        })).toEqual([
          {
            type: 'strong',
            children: ['Rosa']
          },
          ' leads with 3'
        ])
      })

      it('should keep tags in preformatted values as text', () => {
        const format = rich(tags, params({
          name: text()
        }))

        expect(format(ctx, 'By <strong>{name}</strong>')({
          name: 'Tom <link>Jerry</link>'
        })).toEqual([
          'By ',
          {
            type: 'strong',
            children: ['Tom <link>Jerry</link>']
          }
        ])
      })

      it('should format fallback messages with the preformat', () => {
        const format = rich('By <strong>{name}</strong>', tags, params({
          name: text()
        }))

        expect(format(ctx)({
          name: 'Ada'
        })).toEqual([
          'By ',
          {
            type: 'strong',
            children: ['Ada']
          }
        ])
      })

      it('should return undefined from the message of empty input without fallback', () => {
        const format = rich(tags, params({
          name: text()
        }))

        expect(format(ctx)({
          name: 'Ada'
        })).toBeUndefined()
      })
    })
  })
})
