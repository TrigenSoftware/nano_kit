import {
  vi,
  describe,
  it,
  expect
} from 'vitest'
import {
  signal,
  computed
} from '@nano_kit/store'
import {
  Getter,
  preview,
  sizeOf,
  entriesOf,
  sourceOf
} from './values.js'

class Cart {
  total = 99
}

describe('devtools', () => {
  describe('services', () => {
    describe('values', () => {
      describe('preview', () => {
        it('should write primitives the way they are written in code', () => {
          expect(preview(undefined)).toBe('undefined')
          expect(preview(null)).toBe('null')
          expect(preview(true)).toBe('true')
          expect(preview(-1.5)).toBe('-1.5')
          expect(preview(NaN)).toBe('NaN')
          expect(preview(10n)).toBe('10n')
          expect(preview(Symbol('id'))).toBe('Symbol(id)')
        })

        it('should quote a string and keep it on one line', () => {
          expect(preview('say "hi"\nnow')).toBe('"say \\"hi\\"\\nnow"')
        })

        it('should cut a string to the budget', () => {
          expect(preview('abcdefghij', 4)).toBe('"abcd…"')
          expect(preview('abcd', 4)).toBe('"abcd"')
        })

        it('should give the whole string when the budget is unlimited', () => {
          const text = 'x'.repeat(500)

          expect(preview(text, Infinity)).toBe(`"${text}"`)
        })

        it('should name a function and never call it', () => {
          const format = vi.fn()

          expect(preview(format)).toBe(`ƒ ${format.name}()`)
          expect(preview(() => 0)).toBe('ƒ ()')
          expect(format).not.toHaveBeenCalled()
        })

        it('should not read a signal met inside a value', () => {
          const compute = vi.fn(() => 1)

          expect(preview(signal(1))).toBe('Signal')
          expect(preview({
            $total: computed(compute)
          })).toBe('{$total: Signal}')
          expect(compute).not.toHaveBeenCalled()
        })

        it('should show the entries of an object and fold what is nested', () => {
          expect(preview({
            id: 12,
            title: 'Keyboard',
            tags: ['a', 'b', 'c'],
            seller: {
              id: 1
            },
            cart: new Cart()
          })).toBe('{id: 12, title: "Keyboard", tags: Array(3), seller: {…}, cart: Cart {…}}')
          expect(preview({})).toBe('{}')
        })

        it('should put the class before the entries of an instance', () => {
          expect(preview(new Cart())).toBe('Cart {total: 99}')
        })

        it('should take an object without a prototype for a plain one', () => {
          const bare = Object.create(null) as Record<string, number>

          bare.id = 1

          expect(preview(bare)).toBe('{id: 1}')
          expect(preview(Object.create(bare))).toBe('{}')
        })

        it('should show an array with its length', () => {
          expect(preview(['a', 1, null])).toBe('Array(3) ["a", 1, null]')
          expect(preview([])).toBe('Array(0) []')
          expect(preview(new Uint8Array([1, 2]))).toBe('Uint8Array(2) [1, 2]')
        })

        it('should show a map and a set with their sizes', () => {
          expect(preview(new Map<unknown, unknown>([['a', 1], [{}, [1]]]))).toBe('Map(2) {"a" => 1, {…} => Array(1)}')
          expect(preview(new Set(['a', 'b']))).toBe('Set(2) {"a", "b"}')
        })

        it('should stop after a few entries', () => {
          expect(preview([1, 2, 3, 4, 5, 6, 7])).toBe('Array(7) [1, 2, 3, 4, 5, …]')
        })

        it('should stop at the budget', () => {
          // 72 characters after the second entry: the third gets the 8 that are left, the fourth nothing
          expect(preview({
            first: 'a'.repeat(30),
            second: 'b'.repeat(20),
            third: 'c'.repeat(50),
            fourth: 'd'
          })).toBe(`{first: "${'a'.repeat(30)}", second: "${'b'.repeat(20)}", third: "${'c'.repeat(8)}…", …}`)
        })

        it('should write dates, patterns and errors as one value', () => {
          expect(preview(new Date(0))).toBe('1970-01-01T00:00:00.000Z')
          expect(preview(new Date(NaN))).toBe('Invalid Date')
          expect(preview(/a+/gu)).toBe('/a+/gu')
          expect(preview(new TypeError('Nope'))).toBe('TypeError: Nope')
        })

        it('should not run a getter', () => {
          const get = vi.fn(() => 1)

          expect(preview(Object.defineProperty({
            id: 1
          }, 'lazy', {
            enumerable: true,
            get
          }))).toBe('{id: 1, lazy: (…)}')
          expect(get).not.toHaveBeenCalled()
        })

        it('should end on a value that contains itself', () => {
          const node: Record<string, unknown> = {}

          node.self = node

          expect(preview(node)).toBe('{self: {…}}')
        })
      })

      describe('sizeOf', () => {
        it('should count the entries of a collection', () => {
          expect(sizeOf([1, 2, 3])).toBe(3)
          expect(sizeOf(new Uint8Array(4))).toBe(4)
          expect(sizeOf(new Map([['a', 1]]))).toBe(1)
          expect(sizeOf(new Set([1, 2]))).toBe(2)
          expect(sizeOf({
            id: 1,
            title: ''
          })).toBe(2)
        })

        it('should return zero for a leaf', () => {
          expect(sizeOf(null)).toBe(0)
          expect(sizeOf('text')).toBe(0)
          expect(sizeOf(() => 0)).toBe(0)
          expect(sizeOf(signal({
            id: 1
          }))).toBe(0)
          expect(sizeOf(new Date(0))).toBe(0)
          expect(sizeOf({})).toBe(0)
        })
      })

      describe('entriesOf', () => {
        it('should return the properties of an object as live values', () => {
          const seller = {
            id: 1
          }
          const entries = entriesOf({
            id: 12,
            seller
          }, 0, 50)

          expect(entries).toEqual([
            {
              name: 'id',
              value: 12
            },
            {
              name: 'seller',
              value: seller
            }
          ])
          expect(entries[1].value).toBe(seller)
        })

        it('should return a page', () => {
          const value = {
            a: 1,
            b: 2,
            c: 3,
            d: 4
          }

          expect(entriesOf(value, 1, 2).map(entry => entry.name)).toEqual(['b', 'c'])
          expect(entriesOf(value, 3, 2).map(entry => entry.name)).toEqual(['d'])
          expect(entriesOf(value, 4, 2)).toEqual([])
        })

        it('should page through an array without walking it', () => {
          // Holes only: an array of this length cannot be walked in the time of a test
          const sparse: unknown[] = []

          sparse.length = 1e9

          expect(entriesOf(sparse, 5e8, 2)).toEqual([
            {
              name: '500000000',
              value: undefined
            },
            {
              name: '500000001',
              value: undefined
            }
          ])
        })

        it('should name the entries of a map after its keys and the entries of a set after their order', () => {
          expect(entriesOf(new Map<unknown, unknown>([['a', 1], [{}, 2]]), 0, 50)).toEqual([
            {
              name: '"a"',
              value: 1
            },
            {
              name: '{…}',
              value: 2
            }
          ])
          expect(entriesOf(new Set(['x', 'y', 'z']), 1, 1)).toEqual([
            {
              name: '1',
              value: 'y'
            }
          ])
        })

        it('should skip inherited properties', () => {
          expect(entriesOf(Object.create({
            inherited: 1
          }), 0, 50)).toEqual([])
        })

        it('should put a getter in place of the value it would compute', () => {
          const get = vi.fn(() => 1)
          const [entry] = entriesOf(Object.defineProperty({}, 'lazy', {
            enumerable: true,
            get
          }), 0, 50)

          expect(entry).toEqual({
            name: 'lazy',
            value: Getter
          })
          expect(preview(entry.value)).toBe('(…)')
          expect(sizeOf(entry.value)).toBe(0)
          expect(get).not.toHaveBeenCalled()
        })
      })

      describe('sourceOf', () => {
        // A function that tells its source as it is given
        function writtenAs(source: string) {
          return Object.assign(() => undefined, {
            toString: () => source
          })
        }

        it('should move the lines left by the indentation they share', () => {
          expect(sourceOf(writtenAs('() => {\n      $count()\n      $total()\n    }'))).toBe('() => {\n  $count()\n  $total()\n}')
        })

        it('should take tabs for the indentation as well as spaces', () => {
          expect(sourceOf(writtenAs('() => {\n\t\t$count()\n\t}'))).toBe('() => {\n\t$count()\n}')
        })

        it('should keep the empty lines empty', () => {
          expect(sourceOf(writtenAs('() => {\n    one()\n\n    two()\n  }'))).toBe('() => {\n  one()\n\n  two()\n}')
        })

        it('should leave a function on one line as it is', () => {
          expect(sourceOf(writtenAs('() => $count()'))).toBe('() => $count()')
        })
      })
    })
  })
})
