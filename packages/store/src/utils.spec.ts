import {
  vi,
  afterEach,
  beforeEach,
  describe,
  it,
  expect
} from 'vitest'
import {
  batch,
  effect,
  signal
} from 'kida'
import {
  interval,
  latest,
  previous,
  signalNodeAssign
} from './utils.js'

describe('store', () => {
  describe('utils', () => {
    describe('previous', () => {
      it('should return previous value of the signal', () => {
        const $value = signal(1)
        const $previous = previous($value)

        expect($previous()).toBeUndefined()

        $value(2)

        expect($previous()).toBe(1)

        $value(3)

        expect($previous()).toBe(2)
      })

      it('should trigger effect once', () => {
        const $value = signal(1)
        const $previous = previous($value)
        const fn = vi.fn(() => {
          void ($value() && $previous())
        })
        const stop = effect(fn)

        expect(fn).toHaveBeenCalledTimes(1)

        $value(2)
        expect(fn).toHaveBeenCalledTimes(2)

        $value(3)
        expect(fn).toHaveBeenCalledTimes(3)

        stop()
      })
    })

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

    describe('interval', () => {
      beforeEach(() => {
        vi.useFakeTimers()
      })

      afterEach(() => {
        vi.useRealTimers()
        vi.restoreAllMocks()
      })

      it('should increment while mounted', () => {
        const $interval = interval(100)
        const stop = effect(() => {
          $interval()
        })

        expect($interval()).toBe(0)

        vi.advanceTimersByTime(100)
        expect($interval()).toBe(1)

        vi.advanceTimersByTime(200)
        expect($interval()).toBe(3)

        stop()
      })

      it('should stop incrementing after unmount', () => {
        const $interval = interval(100)
        const stop = effect(() => {
          $interval()
        })

        vi.advanceTimersByTime(200)
        expect($interval()).toBe(2)

        stop()

        const valueAfterUnmount = $interval()

        vi.advanceTimersByTime(300)

        expect($interval()).toBe(valueAfterUnmount)
      })
    })

    describe('signalNodeAssign', () => {
      afterEach(() => {
        vi.unstubAllEnvs()
      })

      it('should assign the fields to the node of the signal and return the signal', () => {
        const $count = signal(0)

        expect(signalNodeAssign($count, {
          label: 'count'
        })).toBe($count)
        expect($count.node).toMatchObject({
          label: 'count'
        })
      })

      it('should throw outside of development', () => {
        vi.stubEnv('DEV', false)

        expect(() => signalNodeAssign(signal(0), {})).toThrow('development')
      })
    })
  })
})
