import {
  type Accessor,
  type ReadableSignal,
  signal,
  computed
} from 'agera'
import type { FalsyValue } from './types.js'
import { toSignal } from './utils.js'

export type Resolved<T> = readonly [
  $result: ReadableSignal<T | undefined>,
  $error: ReadableSignal<unknown>,
  $pending: ReadableSignal<boolean>
]

export type ResolvedLike<T> = readonly [...Resolved<T>, ...unknown[]]

interface ResolvedState<T> {
  data: T | undefined
  error: unknown
  pending: boolean
}

const INITIAL_STATE = {
  data: undefined,
  error: undefined,
  pending: false
}

/**
 * Resolve a promise accessor into result, error, and pending signals.
 * When the source promise changes, stale data is preserved while the new
 * promise is pending and the previous promise result is ignored.
 * @param $promise - An accessor that returns a Promise.
 * @returns Tuple of [result, error, pending] readonly signals.
 */
/* @__NO_SIDE_EFFECTS__ */
export function resolved<T>(
  promise: Accessor<T | Promise<T> | FalsyValue> | T | Promise<T> | FalsyValue
): Resolved<T> {
  let currentPromise: T | Promise<T> | FalsyValue = null
  const $promise = toSignal(promise)
  const $state = signal<ResolvedState<T>>(INITIAL_STATE)
  const resolve = () => {
    const promise = $promise() as T | Promise<T> | FalsyValue

    if (currentPromise === promise) {
      return $state()
    }

    currentPromise = promise

    if (!promise) {
      $state(INITIAL_STATE)
      return $state()
    }

    if (promise instanceof Promise) {
      $state(state => ({
        ...state,
        error: undefined,
        pending: true
      }))

      promise.then(
        (data) => {
          if (currentPromise === promise) {
            $state({
              ...INITIAL_STATE,
              data
            })
          }
        },
        (error) => {
          if (currentPromise === promise) {
            $state(state => ({
              ...state,
              error,
              pending: false
            }))
          }
        }
      )
    } else {
      $state({
        ...INITIAL_STATE,
        data: promise
      })
    }

    return $state()
  }

  resolve()

  return [
    computed(() => resolve().data),
    computed(() => resolve().error),
    computed(() => resolve().pending)
  ] as const
}
