import {
  vi,
  afterEach,
  beforeEach,
  describe,
  it,
  expect
} from 'vitest'
import {
  effect,
  signal
} from 'kida'
import {
  interval,
  previous
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
  })
})
