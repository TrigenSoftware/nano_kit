import {
  vi,
  describe,
  expect,
  it
} from 'vitest'
import {
  addFn,
  append,
  prepend,
  drop,
  map,
  sort,
  mapPages,
  mapPageAt,
  mapFirstPage,
  mapLastPage,
  sortPages
} from './utils.js'
import type { InfinitePages } from './client.js'

interface Page {
  items: number[]
}

describe('query', () => {
  describe('utils', () => {
    describe('addFn', () => {
      it('should return function when previous function is empty', () => {
        const fn = vi.fn()

        expect(addFn(undefined, fn)).toBe(fn)
      })

      it('should call both functions', () => {
        const prevFn = vi.fn()
        const fn = vi.fn()
        const result = addFn(prevFn, fn)

        result('value')

        expect(prevFn).toHaveBeenCalledWith('value')
        expect(fn).toHaveBeenCalledWith('value')
      })
    })

    describe('array helpers', () => {
      it('should append value', () => {
        expect(append([1, 2], 3)).toEqual([1, 2, 3])
        expect(append<number[] | null>(null, 1)).toEqual([1])
      })

      it('should prepend value', () => {
        expect(prepend([2, 3], 1)).toEqual([1, 2, 3])
        expect(prepend<number[] | null>(null, 1)).toEqual([1])
      })

      it('should drop matching values', () => {
        expect(drop([1, 2, 3], value => value === 2)).toEqual([1, 3])
        expect(drop(null, () => true)).toBe(null)
      })

      it('should map values', () => {
        const input = [1, 2, 3]

        expect(map(input, (value, index) => value + index)).toEqual([1, 3, 5])
        expect(input).toEqual([1, 2, 3])
        expect(map<number[] | null>(null, value => value * 2)).toBe(null)
      })

      it('should sort values', () => {
        const input = [3, 1, 2]

        expect(sort(input, (a, b) => a - b)).toEqual([1, 2, 3])
        expect(input).toEqual([3, 1, 2])
        expect(sort(null, (a: number, b: number) => a - b)).toBe(null)
      })
    })

    describe('page helpers', () => {
      const pages: InfinitePages<Page, number> = {
        pages: [
          {
            items: [1, 2]
          },
          {
            items: [3, 4]
          },
          {
            items: [5, 6]
          }
        ],
        next: 3,
        more: true
      }

      it('should map pages', () => {
        expect(mapPages(pages, page => ({
          items: page.items.map(value => value * 2)
        }))).toEqual({
          ...pages,
          pages: [
            {
              items: [2, 4]
            },
            {
              items: [6, 8]
            },
            {
              items: [10, 12]
            }
          ]
        })
        expect(mapPages(null, page => page)).toBe(null)
      })

      it('should map page by index', () => {
        expect(mapPageAt(pages, 1, page => ({
          items: page.items.map(value => value * 10)
        }))).toEqual({
          ...pages,
          pages: [
            {
              items: [1, 2]
            },
            {
              items: [30, 40]
            },
            {
              items: [5, 6]
            }
          ]
        })
      })

      it('should return original pages for missing index', () => {
        expect(mapPageAt(pages, 10, page => page)).toBe(pages)
        expect(mapPageAt(null, 0, page => page)).toBe(null)
      })

      it('should map first page', () => {
        expect(mapFirstPage(pages, page => ({
          items: page.items.map(value => value * 10)
        })).pages[0]).toEqual({
          items: [10, 20]
        })
      })

      it('should map last page', () => {
        expect(mapLastPage(pages, page => ({
          items: page.items.map(value => value * 10)
        })).pages[2]).toEqual({
          items: [50, 60]
        })
      })

      it('should sort items across pages', () => {
        const result = sortPages(
          {
            ...pages,
            pages: [
              {
                items: [5, 1]
              },
              {
                items: [4]
              },
              {
                items: [3, 2, 6]
              }
            ]
          },
          (a: number, b: number) => a - b,
          (sort, page) => ({
            ...page,
            items: sort(page.items)
          })
        )

        expect(result?.pages).toEqual([
          {
            items: [1, 2]
          },
          {
            items: [3]
          },
          {
            items: [4, 5, 6]
          }
        ])
        expect(result?.next).toBe(3)
        expect(result?.more).toBe(true)
      })

      it('should keep empty pages value', () => {
        expect(sortPages(
          null as InfinitePages<Page, number> | null,
          (a: number, b: number) => a - b,
          (sort, page) => ({
            items: sort(page.items)
          })
        )).toBe(null)
      })
    })
  })
})
