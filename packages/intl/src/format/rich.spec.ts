import {
  describe,
  expect,
  expectTypeOf,
  it
} from 'vitest'
import { signal } from '@nano_kit/store'
import type { FormatContext } from '../types.js'
import {
  mapTags,
  rich
} from './rich.js'
import {
  cases,
  match
} from './match.js'
import { number } from './number.js'
import { params } from './params.js'
import { plural } from './plural.js'
import { text } from './text.js'

const ctx: FormatContext = {
  $locale: () => 'en-US'
}

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

      it('should fill values into the message with the preformat', () => {
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

      it('should choose a plural form with the preformat', () => {
        const format = rich(tags, plural('count'))
        const message = format(ctx, {
          one: '<strong>{count}</strong> plant',
          other: '<strong>{count}</strong> plants'
        })
        const plants = [
          {
            type: 'strong',
            children: ['3']
          },
          ' plants'
        ]

        expect(message({
          count: 3
        })).toEqual(plants)
        expect(message(3)).toEqual(plants)
      })

      it('should format the value of a plural form with params', () => {
        const format = rich(tags, params({
          count: number()
        }, plural('count')))

        expect(format(ctx, {
          one: '<strong>{count}</strong> plant',
          other: '<strong>{count}</strong> plants'
        })({
          count: 1284
        })).toEqual([
          {
            type: 'strong',
            children: ['1,284']
          },
          ' plants'
        ])
      })

      it('should choose a case with the preformat', () => {
        const format = rich(tags, params({
          name: text()
        }, match('role')))

        expect(format(ctx, {
          admin: '<strong>{name}</strong> runs the garden',
          member: '<strong>{name}</strong> tends the garden'
        })({
          name: 'Ada',
          role: 'member'
        })).toEqual([
          {
            type: 'strong',
            children: ['Ada']
          },
          ' tends the garden'
        ])
      })

      it('should choose nested cases and plural forms with the preformat', () => {
        const format = rich(tags, match('role', cases({
          admin: plural('count'),
          member: plural('count')
        })))

        expect(format(ctx, {
          admin: {
            one: '<strong>Admin</strong> of {count} garden',
            other: '<strong>Admin</strong> of {count} gardens'
          },
          member: {
            one: '<strong>Member</strong> of {count} garden',
            other: '<strong>Member</strong> of {count} gardens'
          }
        })({
          role: 'member',
          count: 2
        })).toEqual([
          {
            type: 'strong',
            children: ['Member']
          },
          ' of 2 gardens'
        ])
      })

      it('should keep tags in values of a plural form as text', () => {
        const format = rich(tags, params({
          name: text()
        }, plural('count')))

        expect(format(ctx, {
          one: '<strong>{name}</strong> has {count} plant',
          other: '<strong>{name}</strong> has {count} plants'
        })({
          name: 'Tom <link>Jerry</link>',
          count: 2
        })).toEqual([
          {
            type: 'strong',
            children: ['Tom <link>Jerry</link>']
          },
          ' has 2 plants'
        ])
      })

      it('should choose a plural form of a fallback message', () => {
        const format = rich('<strong>{count}</strong> items', tags, plural('count'))

        expect(format(ctx)({
          count: 2
        })).toEqual([
          {
            type: 'strong',
            children: ['2']
          },
          ' items'
        ])
      })

      it('should return undefined from the message of a missing plural form', () => {
        const format = rich(tags, plural('count'))

        expect(format(ctx, {
          one: '<strong>{count}</strong> plant'
        })(2)).toBeUndefined()
      })

      it('should pass the values of the call to the tag handlers', () => {
        const format = rich({
          time: (chunks: (string | Node)[], _, values) => {
            expectTypeOf(values).toEqualTypeOf<{
              when: string | undefined
              date: string | undefined
            }>()

            return {
              type: 'time',
              dateTime: values.date,
              children: chunks
            }
          }
        }, params({
          when: text(),
          date: text()
        }))

        expect(format(ctx, 'Last update <time>{when}</time>')({
          when: '14 days ago',
          date: '2026-11-08'
        })).toEqual([
          'Last update ',
          {
            type: 'time',
            dateTime: '2026-11-08',
            children: ['14 days ago']
          }
        ])
      })

      it('should pass the values read from signals', () => {
        const format = rich({
          time: (chunks: (string | Node)[], _, { date }) => ({
            type: 'time',
            dateTime: date,
            children: chunks
          })
        }, params({
          when: text(),
          date: text()
        }))

        expect(format(ctx, '<time>{when}</time>')({
          when: signal('14 days ago'),
          date: () => '2026-11-08'
        })).toEqual([
          {
            type: 'time',
            dateTime: '2026-11-08',
            children: ['14 days ago']
          }
        ])
      })

      it('should pass the values as they are, not formatted, to the tags of a plural form', () => {
        const format = rich({
          strong: (chunks: (string | Node)[], _, { count }) => ({
            type: 'strong',
            count,
            children: chunks
          })
        }, params({
          count: number()
        }, plural('count')))

        expect(format(ctx, {
          one: '<strong>{count}</strong> plant',
          other: '<strong>{count}</strong> plants'
        })({
          count: 1284
        })).toEqual([
          {
            type: 'strong',
            count: 1284,
            children: ['1,284']
          },
          ' plants'
        ])
      })

      it('should pass the values to the tag handlers of a case', () => {
        const format = rich({
          strong: (chunks: (string | Node)[], _, { role }) => ({
            type: 'strong',
            role,
            children: chunks
          })
        }, params({
          name: text()
        }, match('role')))

        expect(format(ctx, {
          admin: '<strong>{name}</strong> runs the garden',
          member: '<strong>{name}</strong> tends the garden'
        })({
          name: 'Ada',
          role: 'member'
        })).toEqual([
          {
            type: 'strong',
            role: 'member',
            children: ['Ada']
          },
          ' tends the garden'
        ])
      })

      it('should pass the value of a call made with the value itself', () => {
        const format = rich({
          strong: (chunks: (string | Node)[], _, values) => ({
            type: 'strong',
            values,
            children: chunks
          })
        }, plural('count'))

        expect(format(ctx, {
          one: '<strong>{count}</strong> plant',
          other: '<strong>{count}</strong> plants'
        })(3)).toEqual([
          {
            type: 'strong',
            values: 3,
            children: ['3']
          },
          ' plants'
        ])
      })

      it('should pass the values to nested tags', () => {
        const format = rich({
          link: (chunks: (string | Node)[], _, { href }) => ({
            type: 'link',
            href,
            children: chunks
          }),
          strong: (chunks: (string | Node)[], _, { href }) => ({
            type: 'strong',
            href,
            children: chunks
          })
        }, params({
          name: text(),
          href: text()
        }))

        expect(format(ctx, '<link>By <strong>{name}</strong></link>')({
          name: 'Ada',
          href: '/ada'
        })).toEqual([
          {
            type: 'link',
            href: '/ada',
            children: [
              'By ',
              {
                type: 'strong',
                href: '/ada',
                children: ['Ada']
              }
            ]
          }
        ])
      })

      it('should pass no values to the tag handlers without a preformat', () => {
        const format = rich({
          strong: (chunks: (string | Node)[], _, values) => {
            expectTypeOf(values).toEqualTypeOf<undefined>()

            return {
              type: 'strong',
              values,
              children: chunks
            }
          }
        })

        expect(format(ctx, '<strong>Ada</strong>')).toEqual([
          {
            type: 'strong',
            values: undefined,
            children: ['Ada']
          }
        ])
      })
    })
  })
})
