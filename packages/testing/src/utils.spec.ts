import {
  describe,
  it,
  expect,
  expectTypeOf
} from 'vitest'
import {
  draft,
  frozen,
  isId,
  matcher
} from './utils.js'

interface Plant {
  id: string
  gardenId: string
  tags?: string[]
}

describe('testing', () => {
  describe('utils', () => {
    describe('frozen', () => {
      it('should return primitives as they are', () => {
        expect(frozen('text')).toBe('text')
        expect(frozen(1)).toBe(1)
        expect(frozen(null)).toBeNull()
        expect(frozen(undefined)).toBeUndefined()
      })

      it('should freeze a copy of plain data all the way down', () => {
        const copy = frozen({
          name: 'Boston fern',
          location: {
            city: 'London'
          },
          tags: [
            {
              label: 'new'
            }
          ]
        })

        expect(Object.isFrozen(copy)).toBe(true)
        expect(Object.isFrozen(copy.location)).toBe(true)
        expect(Object.isFrozen(copy.tags)).toBe(true)
        expect(Object.isFrozen(copy.tags[0])).toBe(true)
      })

      it('should leave the given value as it was', () => {
        const value = {
          tags: ['new']
        }
        const copy = frozen(value)

        expect(copy).toEqual(value)
        expect(copy).not.toBe(value)
        expect(Object.isFrozen(value)).toBe(false)
        expect(Object.isFrozen(value.tags)).toBe(false)
      })

      it('should return what it has made as it is', () => {
        const copy = frozen({
          tags: ['new']
        })

        expect(frozen(copy)).toBe(copy)
        expect(frozen({
          nested: copy
        }).nested).toBe(copy)
      })

      it('should copy what a caller has frozen only at the top', () => {
        const value = Object.freeze({
          tags: ['new']
        })
        const copy = frozen(value)

        expect(copy).not.toBe(value)
        expect(Object.isFrozen(copy.tags)).toBe(true)
      })

      it('should keep by reference what is not plain data', () => {
        const date = new Date(0)
        const map = new Map()
        const copy = frozen({
          date,
          map
        })

        expect(copy.date).toBe(date)
        expect(copy.map).toBe(map)
        expect(Object.isFrozen(date)).toBe(false)
      })

      it('should copy an object without a prototype', () => {
        const value = Object.assign(Object.create(null) as Record<string, string>, {
          name: 'Boston fern'
        })

        expect(frozen(value)).toEqual({
          name: 'Boston fern'
        })
      })

      it('should type an object as read-only and a primitive as it is', () => {
        expectTypeOf(frozen({
          name: 'Boston fern'
        })).toEqualTypeOf<Readonly<{
          name: string
        }>>()
        expectTypeOf(frozen<string | null>(null)).toEqualTypeOf<string | null>()
      })

      it('should type an array as read-only along with its items', () => {
        expectTypeOf(frozen([
          {
            name: 'Boston fern'
          }
        ])).toEqualTypeOf<readonly Readonly<{
          name: string
        }>[]>()
      })
    })

    describe('draft', () => {
      it('should make a writable copy of frozen data all the way down', () => {
        const value = frozen({
          location: {
            city: 'London'
          },
          tags: ['new']
        })
        const copy = draft(value)

        copy.location.city = 'Bucharest'
        copy.tags.push('old')

        expect(copy).toEqual({
          location: {
            city: 'Bucharest'
          },
          tags: ['new', 'old']
        })
        expect(value.location.city).toBe('London')
        expect(value.tags).toEqual(['new'])
      })

      it('should return primitives as they are', () => {
        expect(draft('text')).toBe('text')
        expect(draft(null)).toBeNull()
      })

      it('should keep by reference what is not plain data', () => {
        const date = new Date(0)

        expect(draft({
          date
        }).date).toBe(date)
      })
    })

    describe('isId', () => {
      it('should tell an id from fields and a predicate', () => {
        expect(isId<Plant>('1')).toBe(true)
        expect(isId<{ id: number }>(0)).toBe(true)
        expect(isId<Plant>({
          gardenId: '1'
        })).toBe(false)
        expect(isId<Plant>(() => true)).toBe(false)
      })
    })

    describe('matcher', () => {
      const plant: Plant = {
        id: '1',
        gardenId: '2'
      }

      it('should match a record by its id', () => {
        expect(matcher<Plant>('1')(plant)).toBe(true)
        expect(matcher<Plant>('2')(plant)).toBe(false)
      })

      it('should match a record by every given field', () => {
        expect(matcher<Plant>({
          gardenId: '2'
        })(plant)).toBe(true)
        expect(matcher<Plant>({
          id: '1',
          gardenId: '3'
        })(plant)).toBe(false)
      })

      it('should match every record by no fields', () => {
        expect(matcher<Plant>({})(plant)).toBe(true)
      })

      it('should match a missing field by undefined', () => {
        expect(matcher<Plant>({
          tags: undefined
        })(plant)).toBe(true)
      })

      it('should return a predicate as it is', () => {
        const predicate = (row: Plant) => row.gardenId === '2'

        expect(matcher<Plant>(predicate)).toBe(predicate)
      })
    })
  })
})
