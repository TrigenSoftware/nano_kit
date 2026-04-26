import {
  type Accessor,
  type WritableSignal,
  computed,
  isFunction,
  mountable,
  onStart,
  signal
} from 'kida'
import type { RateLimiter } from './types.js'

/**
 * Create a signal that tracks the previous value of another signal.
 * @param $signal - Store to track the previous value of.
 * @returns A signal that returns the previous value, or undefined if there is none.
 */
/* @__NO_SIDE_EFFECTS__ */
export function previous<T>($signal: Accessor<T>): Accessor<T | undefined> {
  let prev: T | undefined

  return computed(() => {
    const result = prev

    prev = $signal()

    return result
  })
}

/**
 * Create a signal that increments on an interval while mounted.
 * @param ms - Interval duration in milliseconds.
 * @returns A signal containing the current tick count.
 */
/* @__NO_SIDE_EFFECTS__ */
export function interval(ms: number): WritableSignal<number> {
  const $interval = mountable(signal(0))

  onStart($interval, () => {
    const timer = setInterval(() => $interval(prev => prev + 1), ms)

    return () => clearInterval(timer)
  })

  return $interval
}

/**
 * Create debounced function.
 * @param fn
 * @returns Debounced function.
 */
export function debounce<T extends unknown[]>(fn: (...args: T) => void): (...args: T) => void

/**
 * Create debounce function with given delay.
 * @param delay - Delay in milliseconds.
 * @returns Debounce function.
 */
export function debounce(delay?: number): RateLimiter

/* @__NO_SIDE_EFFECTS__ */
export function debounce(fnOrDelay?: (() => void) | number) {
  if (isFunction(fnOrDelay)) {
    return debounce()(fnOrDelay)
  }

  return (fn: (...args: unknown[]) => void) => {
    let timer: ReturnType<typeof setTimeout>

    return (...args: unknown[]) => {
      clearTimeout(timer)
      timer = setTimeout(fn, fnOrDelay, ...args)
    }
  }
}

/**
 * Create throttled function.
 * @param fn
 * @returns Throttled function.
 */
export function throttle<T extends unknown[]>(fn: (...args: T) => void): (...args: T) => void

/**
 * Create throttle function with given delay.
 * @param delay - Delay in milliseconds.
 * @returns Throttle function.
 */
export function throttle(delay?: number): RateLimiter

/* @__NO_SIDE_EFFECTS__ */
export function throttle(fnOrDelay?: (() => void) | number) {
  if (isFunction(fnOrDelay)) {
    return throttle()(fnOrDelay)
  }

  return (fn: (...args: unknown[]) => void) => {
    let lastArgs: unknown[] | null = null
    let lastTime = 0
    let timer: ReturnType<typeof setTimeout> | null = null
    const delay = fnOrDelay ?? 0
    const invoke = () => {
      if (lastArgs) {
        fn(...lastArgs)
        lastArgs = null
        lastTime = Date.now()
      }

      timer = null
    }

    return (...args: unknown[]) => {
      const now = Date.now()
      const remaining = delay - (now - lastTime)

      lastArgs = args

      if (remaining <= 0 || remaining > delay) {
        if (timer) {
          clearTimeout(timer)
          timer = null
        }

        fn(...args)
        lastTime = now
        lastArgs = null
      } else
        if (!timer) {
          timer = setTimeout(invoke, remaining)
        }
    }
  }
}

/**
 * Return the original function without rate limiting.
 * @param fn - Function to return as-is.
 * @returns The original function.
 */
/* @__NO_SIDE_EFFECTS__ */
export function noLimit<T extends unknown[]>(fn: (...args: T) => void): (...args: T) => void {
  return fn
}
