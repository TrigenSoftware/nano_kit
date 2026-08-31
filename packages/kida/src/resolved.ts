import {
  type Accessor,
  type ReadableSignal,
  signal,
  computed,
  untracked
} from 'agera'
import { task } from './tasks.js'
import { toSignal } from './utils.js'

export type Resolved<T> = readonly [
  $result: ReadableSignal<T | undefined>,
  $error: ReadableSignal<unknown>,
  $pending: ReadableSignal<boolean>
]

export type ResolvedLike<T> = readonly [...Resolved<T>, ...unknown[]]

/**
 * Resolve a promise accessor into result, error, and pending signals.
 * When the source promise changes, stale data is preserved while the new
 * promise is pending and the previous promise result is ignored.
 * @param $promise - An accessor that returns a Promise.
 * @returns Tuple of [result, error, pending] readonly signals.
 */
/* @__NO_SIDE_EFFECTS__ */
export function resolved<T>(
  promise: Accessor<T | Promise<T>> | T | Promise<T>
): Resolved<T> {
  let currentPromise: T | Promise<T> | undefined
  let data: T | undefined
  let error: unknown
  const $promise = toSignal(promise)
  // The pending flag doubles as the task target and the only notifier:
  // `data` and `error` live in the closure and may only change together
  // with a `$state` write or a `$promise` change
  const $state = signal(false)
  const resolve = () => {
    const value = $promise() as T | Promise<T>

    if (currentPromise !== value) {
      currentPromise = value
      error = undefined

      if (value instanceof Promise) {
        $state(true)

        // The pool holds the writer chain, so a wait wakes up strictly
        // after the state is written
        void task($state, value.then(
          (nextData) => {
            if (currentPromise === value) {
              data = nextData
              $state(false)
            }
          },
          (nextError) => {
            if (currentPromise === value) {
              error = nextError
              $state(false)
            }
          }
        ))
      } else {
        data = value
        $state(false)
      }
    }

    return $state()
  }

  if (promise instanceof Promise) {
    untracked(resolve)
  }

  return [
    computed(() => (resolve(), data)),
    computed(() => (resolve(), error)),
    computed(resolve)
  ] as const
}
