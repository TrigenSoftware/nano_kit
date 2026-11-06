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
  restore,
  map,
  sort,
  mapPages,
  mapPageAt,
  mapFirstPage,
  mapLastPage,
  sortPages,
  restorePages
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

      describe('restore', () => {
        const isTwo = (value: number) => value === 2

        it('should put a value back at its previous index', () => {
          expect(restore([1, 3], [1, 2, 3], isTwo)).toEqual([1, 2, 3])
        })

        it('should keep values written since', () => {
          expect(restore([1, 3, 4], [1, 2, 3], isTwo)).toEqual([1, 2, 3, 4])
        })

        it('should put back every removed value', () => {
          const isEven = (value: number) => value % 2 === 0

          expect(restore([1, 3, 5], [1, 2, 3, 4, 5, 6], isEven)).toEqual([1, 2, 3, 4, 5, 6])
        })

        it('should put a value back into an empty array', () => {
          expect(restore([], [2], isTwo)).toEqual([2])
        })

        it('should put a value at the end when the array became shorter', () => {
          expect(restore([1], [1, 3, 4, 2], isTwo)).toEqual([1, 2])
        })

        it('should not mutate arrays', () => {
          const array = [1, 3]
          const prev = [1, 2, 3]

          restore(array, prev, isTwo)

          expect(array).toEqual([1, 3])
          expect(prev).toEqual([1, 2, 3])
        })

        it('should keep the array when it holds the value again', () => {
          const array = [2, 1, 3]

          expect(restore(array, [1, 2, 3], isTwo)).toBe(array)
        })

        it('should keep the array when the previous one did not hold the value', () => {
          const array = [1, 3]

          expect(restore(array, [1, 3], isTwo)).toBe(array)
        })

        it('should keep the array when there is no previous one', () => {
          const array = [1, 3]

          expect(restore<number[] | null>(array, null, isTwo)).toBe(array)
        })

        it('should keep the empty value', () => {
          expect(restore<number[] | null>(null, [1, 2, 3], isTwo)).toBe(null)
        })
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

      describe('restorePages', () => {
        const isFour = (value: number) => value === 4
        const removed = mapPages(pages, page => ({
          items: drop(page.items, isFour)
        }))
        const adapter = (restoreItems: (items: number[]) => number[], page: Page) => ({
          items: restoreItems(page.items)
        })

        it('should put an item back into the page it stood in', () => {
          expect(restorePages(removed, pages, isFour, adapter)).toEqual(pages)
        })

        it('should keep items written since', () => {
          const current = mapFirstPage(removed, page => ({
            items: prepend(page.items, 0)
          }))

          expect(restorePages(current, pages, isFour, adapter).pages).toEqual([
            {
              items: [0, 1, 2]
            },
            {
              items: [3, 4]
            },
            {
              items: [5, 6]
            }
          ])
        })

        it('should keep the pagination of the current pages', () => {
          const result = restorePages({
            ...removed,
            next: 4,
            more: false
          }, pages, isFour, adapter)

          expect(result.next).toBe(4)
          expect(result.more).toBe(false)
        })

        it('should put back items of several pages', () => {
          const isEven = (value: number) => value % 2 === 0
          const current = mapPages(pages, page => ({
            items: drop(page.items, isEven)
          }))

          expect(restorePages(current, pages, isEven, adapter)).toEqual(pages)
        })

        it('should adapt a page shape', () => {
          interface PostsPage {
            posts: number[]
            cursor: number
          }

          const page = (posts: number[]): PostsPage => ({
            posts,
            cursor: 1
          })
          const pagesOf = (posts: number[]): InfinitePages<PostsPage, number> => ({
            pages: [page(posts)],
            next: 2,
            more: true
          })

          expect(restorePages(pagesOf([3]), pagesOf([3, 4]), isFour, (restoreItems, page) => ({
            ...page,
            posts: restoreItems(page.posts)
          }))).toEqual(pagesOf([3, 4]))
        })

        it('should keep pages when an item is back on another page', () => {
          const current = {
            ...removed,
            pages: [
              {
                items: [4]
              },
              ...removed.pages
            ]
          }

          expect(restorePages(current, pages, isFour, adapter)).toBe(current)
        })

        it('should keep a page loaded since', () => {
          const page = {
            items: [7, 8]
          }
          const result = restorePages({
            ...removed,
            pages: [...removed.pages, page]
          }, pages, isFour, adapter)

          expect(result.pages.at(-1)).toBe(page)
          expect(result.pages[1].items).toEqual([3, 4])
        })

        it('should not put an item back when its page is no longer loaded', () => {
          const current = {
            ...removed,
            pages: removed.pages.slice(0, 1)
          }

          expect(restorePages(current, pages, isFour, adapter)).toEqual(current)
        })

        it('should keep pages when there are no previous ones', () => {
          expect(restorePages<InfinitePages<Page, number> | null, number>(removed, null, isFour, adapter)).toBe(removed)
        })

        it('should keep empty pages value', () => {
          expect(restorePages<InfinitePages<Page, number> | null, number>(null, pages, isFour, adapter)).toBe(null)
        })
      })
    })
  })
})
