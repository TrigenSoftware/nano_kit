import {
  type Accessor,
  type ReadableSignal,
  signal,
  computed,
  isFunction
} from 'agera'
import type { FalsyValue } from './types.js'

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
  $promise: Accessor<Promise<T> | FalsyValue> | Promise<T> | FalsyValue
): readonly [
  $result: ReadableSignal<T | undefined>,
  $error: ReadableSignal<unknown>,
  $pending: ReadableSignal<boolean>
] {
  let currentPromise: Promise<T> | FalsyValue = null
  const $state = signal<ResolvedState<T>>(INITIAL_STATE)
  const resolve = () => {
    const promise = isFunction($promise) ? $promise() : $promise

    if (currentPromise === promise) {
      return $state()
    }

    currentPromise = promise

    if (!promise) {
      $state(INITIAL_STATE)
      return $state()
    }

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

    return $state()
  }

  resolve()

  return [
    computed(() => resolve().data),
    computed(() => resolve().error),
    computed(() => resolve().pending)
  ] as const
}
