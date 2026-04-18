import {
  type Accessor,
  type NewValue,
  type WritableSignal,
  morph,
  mountable,
  onMount,
  signal,
  subscribe,
  untracked
} from 'kida'
import type { RateLimiter } from './types.js'

/**
 * Creates a compute function that returns a rate-limited value from an accessor.
 * @param $signal - The signal to read from.
 * @param rateLimiter - The rate limiter function.
 * @returns Compute function for `computed`.
 */
/* @__NO_SIDE_EFFECTS__ */
export function pace<T>(
  $signal: Accessor<T>,
  rateLimiter: RateLimiter
) {
  const $paced = signal<T>(untracked($signal))
  const update = rateLimiter<[T]>($paced)

  return () => {
    const value = $signal()
    const paced = $paced()

    if (value !== paced) {
      update(value)
    }

    return paced
  }
}

/**
 * Creates a proxy signal that updates the original signal using the provided rate limiter.
 * @param $signal - The signal to pace.
 * @param rateLimiter - The rate limiter function.
 * @returns The proxy signal.
 */
/* @__NO_SIDE_EFFECTS__ */
export function paced<T>(
  $signal: WritableSignal<T>,
  rateLimiter: RateLimiter
) {
  const $proxy = mountable(signal<T>(untracked($signal)))
  const update = rateLimiter<[NewValue<T>]>($signal)

  onMount($proxy, () => subscribe($signal, $proxy))

  return morph($proxy, {
    set(value: NewValue<T>) {
      $proxy(value)
      update(value)
    }
  })
}
