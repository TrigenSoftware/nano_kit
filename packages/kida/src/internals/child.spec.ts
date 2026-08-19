import {
  vi,
  describe,
  it,
  expect
} from 'vitest'
import {
  signal,
  mountable,
  effect
} from 'agera'
import { assignKey } from './utils.js'
import { onMount } from './lifecycle.js'
import { child } from './child.js'

describe('kida', () => {
  describe('internals', () => {
    describe('child', () => {
      it('should lazy get and set child value', () => {
        const $map = signal({
          a: 0,
          b: 1,
          c: 2
        })
        const $b = child($map, 'b', assignKey)

        expect($b()).toBe(1)

        $b(3)

        expect($map()).toEqual({
          a: 0,
          b: 3,
          c: 2
        })
        expect($b()).toBe(3)

        $map({
          a: 4,
          b: 5,
          c: 6
        })

        expect($b()).toBe(5)
      })

      it('should reactively update child value', () => {
        const $map = signal({
          a: 0,
          b: 1,
          c: 2
        })
        const $b = child($map, 'b', assignKey)
        const listener = vi.fn()
        const off = effect(() => {
          listener($b())
        })

        expect(listener).toHaveBeenCalledTimes(1)
        expect(listener).toHaveBeenCalledWith(1)

        $map({
          a: 1,
          b: 2,
          c: 3
        })

        expect(listener).toHaveBeenCalledTimes(2)
        expect(listener).toHaveBeenCalledWith(2)
        expect($b()).toBe(2)

        $b(4)

        expect(listener).toHaveBeenCalledTimes(3)
        expect(listener).toHaveBeenCalledWith(4)
        expect($map()).toEqual({
          a: 1,
          b: 4,
          c: 3
        })

        off()
      })

      it('should handle dynamic key', () => {
        const $map = signal({
          a: 0,
          b: 1,
          c: 2
        })
        const $key = signal<'a' | 'b'>('b')
        const $item = child($map, $key, assignKey)

        expect($item()).toBe(1)

        $key('a')

        expect($item()).toBe(0)
      })

      it('should handle and listen dynamic key', () => {
        const $map = signal({
          a: 0,
          b: 1,
          c: 2
        })
        const $key = signal<'a' | 'b'>('b')
        const $b = child($map, $key, assignKey)
        const listener = vi.fn()
        const off = effect(() => {
          listener($b())
        })

        expect($b()).toBe(1)

        expect(listener).toHaveBeenCalledTimes(1)
        expect(listener).toHaveBeenCalledWith(1)

        $map({
          a: 1,
          b: 2,
          c: 3
        })

        expect(listener).toHaveBeenCalledTimes(2)
        expect(listener).toHaveBeenCalledWith(2)
        expect($b()).toBe(2)

        $b(4)

        expect(listener).toHaveBeenCalledTimes(3)
        expect(listener).toHaveBeenCalledWith(4)
        expect($map()).toEqual({
          a: 1,
          b: 4,
          c: 3
        })

        $key('a')

        expect(listener).toHaveBeenCalledTimes(4)
        expect(listener).toHaveBeenCalledWith(1)
        expect($b()).toBe(1)

        $b(5)

        expect(listener).toHaveBeenCalledTimes(5)
        expect(listener).toHaveBeenCalledWith(5)
        expect($map()).toEqual({
          a: 5,
          b: 4,
          c: 3
        })

        off()
      })

      it('should not rerun an effect that writes the child it reads', () => {
        const $map = signal({
          a: 'clean'
        })
        const $a = child($map, 'a', assignKey)
        let runs = 0
        // an effect that normalises the child it reads settles: a writer is
        // never woken by its own write
        const stop = effect(() => {
          const value = $a()

          runs++

          if (runs > 10) {
            throw new Error('runaway')
          }

          if (value !== value.trim()) {
            $a(value.trim())
          }
        })

        runs = 0

        $map({
          a: '  dirty  '
        })

        expect(runs).toBe(1)
        expect($map()).toEqual({
          a: 'dirty'
        })

        stop()
      })

      it('should not fire mount listeners from inside an effect that writes a child', () => {
        const log: string[] = []
        const $map = signal({
          a: 1
        })
        const $a = child($map, 'a', assignKey)
        const $mountable = mountable(signal('x'))

        onMount($mountable, () => {
          log.push('mounted')
        })

        // reaches the mountable signal only once the write has landed, so
        // the flush the write triggers is what makes it live
        const stopReader = effect(() => {
          if ($map().a === 2) {
            $mountable()
          }
        })
        const stopWriter = effect(() => {
          log.push('start')

          if ($a() === 1) {
            $a(2)
          }

          log.push('end')
        })

        expect(log).toEqual([
          'start',
          'end',
          'mounted'
        ])

        stopWriter()
        stopReader()
      })
    })
  })
})
