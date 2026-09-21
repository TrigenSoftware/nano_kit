import {
  vi,
  describe,
  it,
  expect,
  expectTypeOf
} from 'vitest'
import {
  batch,
  computed,
  effect,
  isMounted,
  isWritable,
  mountable
} from 'kida'
import {
  SignalsMap,
  IndexedSignalsMap
} from './map.js'

describe('store', () => {
  describe('map', () => {
    describe('SignalsMap', () => {
      describe('get', () => {
        it('should return the value', () => {
          const map = new SignalsMap<string, number>().set('foo', 42)

          expect(map.get('foo')).toBe(42)
        })

        it('should return undefined when the key is missing', () => {
          const map = new SignalsMap<string, number>()

          expect(map.get('foo')).toBeUndefined()
        })

        it('should not track the value', () => {
          const map = new SignalsMap<string, number>().set('foo', 42)
          const listener = vi.fn()
          const off = effect(() => {
            listener(map.get('foo'))
          })

          map.set('foo', 100)

          expect(listener).toHaveBeenCalledTimes(1)

          off()
        })
      })

      describe('$get', () => {
        it('should run the reader again when the value changes', () => {
          const map = new SignalsMap<string, number>().set('foo', 42)
          const listener = vi.fn()
          const off = effect(() => {
            listener(map.$get('foo'))
          })

          map.set('foo', 100)

          expect(listener).toHaveBeenCalledTimes(2)
          expect(listener).toHaveBeenLastCalledWith(100)

          off()
        })

        it('should not run the reader again when another key is set', () => {
          const map = new SignalsMap<string, number>().set('foo', 42)
          const listener = vi.fn()
          const off = effect(() => {
            listener(map.$get('foo'))
          })

          map.set('bar', 1)
          map.set('bar', 2)

          expect(listener).toHaveBeenCalledTimes(1)

          off()
        })

        it('should run the reader again when its missing key appears', () => {
          const map = new SignalsMap<string, number>()
          const listener = vi.fn()
          const off = effect(() => {
            listener(map.$get('foo'))
          })

          expect(listener).toHaveBeenLastCalledWith(undefined)

          map.set('foo', 42)

          expect(listener).toHaveBeenLastCalledWith(42)

          off()
        })

        it('should run the reader once when the key is deleted', () => {
          const map = new SignalsMap<string, number>().set('foo', 42)
          const listener = vi.fn()
          const off = effect(() => {
            listener(map.$get('foo'))
          })

          map.delete('foo')

          expect(listener).toHaveBeenCalledTimes(2)
          expect(listener).toHaveBeenLastCalledWith(undefined)

          off()
        })

        it('should run the reader again when a key holding undefined is deleted and set again', () => {
          const map = new SignalsMap<string, number>().set('foo', undefined)
          const listener = vi.fn()
          const off = effect(() => {
            listener(map.$get('foo'))
          })

          map.delete('foo')
          map.set('foo', 42)

          expect(listener).toHaveBeenLastCalledWith(42)

          off()
        })

        it('should run the reader again when a key holding undefined is cleared and set again', () => {
          const map = new SignalsMap<string, number>().set('foo', undefined)
          const listener = vi.fn()
          const off = effect(() => {
            listener(map.$get('foo'))
          })

          map.clear()
          map.set('foo', 42)

          expect(listener).toHaveBeenLastCalledWith(42)

          off()
        })

        it('should follow a key deleted and set again within one batch', () => {
          const map = new SignalsMap<string, number>().set('foo', 42)
          const listener = vi.fn()
          const off = effect(() => {
            listener(map.$get('foo'))
          })

          batch(() => {
            map.delete('foo')
            map.set('foo', 100)
          })

          expect(listener).toHaveBeenLastCalledWith(100)

          // the value lives in a new signal now: the reader has to be on it
          map.set('foo', 200)

          expect(listener).toHaveBeenLastCalledWith(200)

          off()
        })
      })

      describe('set', () => {
        it('should reduce the current value', () => {
          const map = new SignalsMap<string, number>().set('foo', 42)

          map.set('foo', value => (value ?? 0) + 1)

          expect(map.get('foo')).toBe(43)
        })

        it('should return the map', () => {
          const map = new SignalsMap<string, number>()

          expect(map.set('foo', 42)).toBe(map)
        })

        it('should keep a key set to undefined', () => {
          const map = new SignalsMap<string, number>().set('foo', undefined)

          expect(map.has('foo')).toBe(true)
          expect(map.get('foo')).toBeUndefined()
        })
      })

      describe('delete', () => {
        it('should tell whether the key was there', () => {
          const map = new SignalsMap<string, number>().set('foo', 42)

          expect(map.delete('foo')).toBe(true)
          expect(map.delete('foo')).toBe(false)
        })
      })

      describe('clear', () => {
        it('should run the reader of every key again, once', () => {
          const map = new SignalsMap<string, number>().set('foo', 1).set('bar', 2)
          const fooListener = vi.fn()
          const barListener = vi.fn()
          const offFoo = effect(() => {
            fooListener(map.$get('foo'))
          })
          const offBar = effect(() => {
            barListener(map.$get('bar'))
          })

          map.clear()

          expect(map.size).toBe(0)
          expect(fooListener).toHaveBeenCalledTimes(2)
          expect(fooListener).toHaveBeenLastCalledWith(undefined)
          expect(barListener).toHaveBeenCalledTimes(2)
          expect(barListener).toHaveBeenLastCalledWith(undefined)

          offFoo()
          offBar()
        })

        it('should follow a key cleared and set again within one batch', () => {
          const map = new SignalsMap<string, number>().set('foo', 42)
          const listener = vi.fn()
          const off = effect(() => {
            listener(map.$get('foo'))
          })

          batch(() => {
            map.clear()
            map.set('foo', 100)
          })
          map.set('foo', 200)

          expect(listener).toHaveBeenLastCalledWith(200)

          off()
        })
      })

      describe('as a Map', () => {
        it('should keep has, keys and size', () => {
          const map = new SignalsMap<string, number>().set('foo', 1).set('bar', 2)

          expect(map).toBeInstanceOf(Map)
          expect(map.has('foo')).toBe(true)
          expect(map.has('baz')).toBe(false)
          expect([...map.keys()]).toEqual(['foo', 'bar'])
          expect(map.size).toBe(2)
        })

        it('should hide whatever hands a signal out', () => {
          const map = new SignalsMap<string, number>()

          // @ts-expect-error the items are signals, and a signal must not leave the map
          map.values()
          // @ts-expect-error the items are signals, and a signal must not leave the map
          map.entries()
          // @ts-expect-error the items are signals, and a signal must not leave the map
          map.forEach(vi.fn())

          expectTypeOf(map.get('foo')).toEqualTypeOf<number | undefined>()
          expectTypeOf(map.$get('foo')).toEqualTypeOf<number | undefined>()
        })

        it('should not take initial entries', () => {
          // The Map constructor would call `set` before the map is ready for it
          // @ts-expect-error no arguments
          expect(() => new SignalsMap<string, number>([['foo', 42]])).toThrow()
        })
      })
    })

    describe('IndexedSignalsMap', () => {
      describe('$get', () => {
        it('should run the reader again when the value changes', () => {
          const map = new IndexedSignalsMap<string, number>().set('foo', 42)
          const listener = vi.fn()
          const off = effect(() => {
            listener(map.$get('foo'))
          })

          map.set('foo', 100)

          expect(listener).toHaveBeenCalledTimes(2)
          expect(listener).toHaveBeenLastCalledWith(100)

          off()
        })

        it('should run the reader again when its missing key appears', () => {
          const map = new IndexedSignalsMap<string, number>()
          const listener = vi.fn()
          const off = effect(() => {
            listener(map.$get('foo'))
          })

          map.set('foo', 42)

          expect(listener).toHaveBeenLastCalledWith(42)

          off()
        })
      })

      describe('$index', () => {
        it('should list the keys in the order they were added', () => {
          const map = new IndexedSignalsMap<string, number>()
            .set('foo', 1)
            .set('bar', 2)

          map.delete('foo')
          map.set('foo', 3)

          expect(map.$index()).toEqual(['bar', 'foo'])
        })

        it('should run the reader again when a key is added or removed', () => {
          const map = new IndexedSignalsMap<string, number>()
          const listener = vi.fn()
          const off = effect(() => {
            listener(map.$index())
          })

          map.set('foo', 42)

          expect(listener).toHaveBeenLastCalledWith(['foo'])

          map.delete('foo')

          expect(listener).toHaveBeenCalledTimes(3)
          expect(listener).toHaveBeenLastCalledWith([])

          off()
        })

        it('should not run the reader again when a value is set', () => {
          const map = new IndexedSignalsMap<string, number>().set('foo', 42)
          const listener = vi.fn()
          const off = effect(() => {
            listener(map.$index())
          })

          map.set('foo', 100)

          expect(listener).toHaveBeenCalledTimes(1)

          off()
        })

        it('should run the reader once for a batch of mutations', () => {
          const map = new IndexedSignalsMap<string, number>()
          const listener = vi.fn()
          const off = effect(() => {
            listener(map.$index())
          })

          batch(() => {
            map.set('foo', 1)
            map.set('bar', 2)
            map.delete('foo')
          })

          expect(listener).toHaveBeenCalledTimes(2)
          expect(listener).toHaveBeenLastCalledWith(['bar'])

          off()
        })

        it('should run a reader of both the keys and an item once per deletion', () => {
          const map = new IndexedSignalsMap<string, number>().set('foo', 42)
          const listener = vi.fn()
          const off = effect(() => {
            listener(map.$index().length, map.$get('foo'))
          })

          map.delete('foo')

          expect(listener).toHaveBeenCalledTimes(2)
          expect(listener).toHaveBeenLastCalledWith(0, undefined)

          off()
        })

        it('should not be writable', () => {
          const map = new IndexedSignalsMap<string, number>()

          expect(isWritable(map.$index)).toBe(false)
        })
      })

      describe('lifecycle', () => {
        it('should be mounted by a reader of an item', () => {
          const map = new IndexedSignalsMap<string, number>().set('foo', 42)

          mountable(map.$index)

          const off = effect(() => {
            map.$get('foo')
          })

          expect(isMounted(map.$index)).toBe(true)

          off()
        })

        it('should be mounted by a reader of a missing key', () => {
          const map = new IndexedSignalsMap<string, number>()

          mountable(map.$index)

          const off = effect(() => {
            map.$get('foo')
          })

          expect(isMounted(map.$index)).toBe(true)

          off()
        })

        it('should be mounted by a reader of the keys', () => {
          const map = new IndexedSignalsMap<string, number>()

          mountable(map.$index)

          const off = effect(() => {
            map.$index()
          })

          expect(isMounted(map.$index)).toBe(true)

          off()
        })

        it('should be mounted through a computed only while it is watched', () => {
          const map = new IndexedSignalsMap<string, number>().set('foo', 42)

          mountable(map.$index)

          const $foo = computed(() => map.$get('foo'))

          $foo()

          expect(isMounted(map.$index)).toBe(false)

          const off = effect(() => {
            $foo()
          })

          expect(isMounted(map.$index)).toBe(true)

          off()

          expect(isMounted(map.$index)).toBe(false)
        })

        it('should be unmounted when the last reader is gone', () => {
          const map = new IndexedSignalsMap<string, number>().set('foo', 42)

          mountable(map.$index)

          const offItem = effect(() => {
            map.$get('foo')
          })
          const offKeys = effect(() => {
            map.$index()
          })

          offItem()

          expect(isMounted(map.$index)).toBe(true)

          offKeys()

          expect(isMounted(map.$index)).toBe(false)
        })

        it('should not be mounted by reads outside of an effect', () => {
          const map = new IndexedSignalsMap<string, number>().set('foo', 42)

          mountable(map.$index)
          map.get('foo')
          map.$get('foo')
          map.$index()

          expect(isMounted(map.$index)).toBe(false)
        })
      })
    })
  })
})
