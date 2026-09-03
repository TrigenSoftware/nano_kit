import {
  vi,
  describe,
  it,
  expect
} from 'vitest'
import {
  signal,
  effect,
  batch
} from 'agera'
import { latest } from './utils.js'

describe('kida', () => {
  describe('utils', () => {
    describe('latest', () => {
      it('should return the last source value on the first read', () => {
        const $a = signal('a')
        const $b = signal('b')
        const $latest = latest($a, $b)

        expect($latest()).toBe('b')
      })

      it('should return the last source value on the first read when it is undefined', () => {
        const $a = signal<string | undefined>('a')
        const $b = signal<string | undefined>(undefined)
        const $latest = latest($a, $b)

        expect($latest()).toBeUndefined()
      })

      it('should return the value of the source that changed last', () => {
        const $a = signal('a')
        const $b = signal('b')
        const $latest = latest($a, $b)
        const listener = vi.fn()
        const off = effect(() => {
          listener($latest())
        })

        $a('a1')
        $b('b1')
        $a('a2')

        expect(listener.mock.calls).toEqual([['b'], ['a1'], ['b1'], ['a2']])

        off()
      })

      it('should return the last changed source when several sources changed in a batch', () => {
        const $a = signal('a')
        const $b = signal('b')
        const $latest = latest($a, $b)
        const off = effect(() => {
          $latest()
        })

        batch(() => {
          $b('b1')
          $a('a1')
        })

        expect($latest()).toBe('b1')

        off()
      })

      it('should return the last changed source when several sources changed between reads', () => {
        const $a = signal('a')
        const $b = signal('b')
        const $latest = latest($a, $b)

        expect($latest()).toBe('b')

        $b('b1')
        $a('a1')

        expect($latest()).toBe('b1')
      })

      it('should keep the value when a source is written with an equal value', () => {
        const $a = signal('a')
        const $b = signal('b')
        const $latest = latest($a, $b)

        expect($latest()).toBe('b')

        $a('a')

        expect($latest()).toBe('b')
      })

      it('should keep the value when nothing changed since the last read', () => {
        const $a = signal('a')
        const $b = signal('b')
        const $latest = latest($a, $b)
        const off = effect(() => {
          $latest()
        })

        $a('a1')

        expect($latest()).toBe('a1')

        // Losing the last subscriber purges the deps and forces the next read
        // to recompute with no source changed
        off()

        expect($latest()).toBe('a1')
      })
    })
  })
})
