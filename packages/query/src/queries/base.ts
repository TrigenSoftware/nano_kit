import {
  type Accessor,
  type Signalish,
  action,
  computed,
  effect,
  effectScope,
  mountable,
  onStart,
  $get,
  task
} from '@nano_kit/store'
import type { ClientSetting } from '../client.types.js'
import type {
  CacheKey,
  CacheKeyBuilder
} from '../cache.types.js'
import { UNSET_REV } from '../CacheStorage.js'
import {
  type ClientContext,
  type QueryClientContext,
  forkQueryClient
} from '../ClientContext.js'
import { QueryContext } from '../RequestContext.js'

declare const skip: unique symbol

/**
 * A query parameter wrapped in `required()`: it gives the value, or an internal mark while there is none.
 */
export type RequiredParam<T> = Accessor<T | typeof skip>

export type SignalishParams<T extends unknown[]> = T extends [infer First, ...infer Rest]
  ? [Signalish<First> | RequiredParam<First>, ...SignalishParams<Rest>]
  : []

// The value of a required parameter while it has none, and the parameters of the query it skips:
// empty, so the key filter gets every parameter as missing, as its `Partial<P>` type promises.
// Typed as a symbol, so a read outside the parameters is flagged in strings and arithmetic
const SKIP: typeof skip = [] as never

/**
 * Mark a query parameter as required: while it is `undefined` or `null`, the query is skipped.
 * It neither fetches nor creates a cache entry, and its fetcher receives the parameter as non-nullable.
 * @param $param - The parameter signal.
 * @returns The required parameter, which gives an internal mark instead of a missing value.
 */
/* @__NO_SIDE_EFFECTS__ */
export function required<T>($param: Accessor<T>): RequiredParam<NonNullable<T>> {
  return () => $param() ?? SKIP
}

/* @__NO_SIDE_EFFECTS__ */
export function baseQuery<
  P extends unknown[],
  E extends unknown[],
  R
>(
  rootCtx: ClientContext,
  key: CacheKeyBuilder<P, R>,
  params: SignalishParams<P>,
  fn: (...args: [...P, ...E, queryCtx: QueryContext<P, R>]) => Promise<R>,
  settings?: ClientSetting<QueryClientContext<P, R>>[],
  // How the mounted query asks for its data by itself; an operation is run by hand and passes none
  auto?: (fetch: (...extraParams: E) => unknown) => unknown
) {
  const $params = computed(() => {
    const values = params.map($get)

    return (values.includes(SKIP) ? SKIP : values) as unknown as P
  })
  const $key = computed((prevKey?: CacheKey<P, R>) => {
    const nextKey = key(...$params())

    if (
      prevKey
      && prevKey.shard === nextKey.shard
      && prevKey.key === nextKey.key
    ) {
      return prevKey
    }

    return nextKey
  })
  const clientCtx = forkQueryClient<P, R>(rootCtx, $key, settings)
  // A required parameter without a value skips the query: its entry is locked, so nothing is
  // fetched, and stays out of the cache, which holds only keys with every parameter they need
  const $entry = computed(() => (
    $params() as unknown === SKIP
      ? {
        ...clientCtx.initial(),
        rev: -1
      }
      : clientCtx.$get($key())
  ))
  /**
   * Changes on every entry rev reset
   */
  const $rev = computed((v: number = 0): number => ($entry().rev === UNSET_REV ? v + 1 : v))
  const { mapComputedData } = clientCtx
  const $data = mountable(computed(() => mapComputedData($entry().data as R | null)))
  const $error = computed(() => $entry().error)
  const $loading = computed(() => $entry().loading)
  let prevQueryCtx: QueryContext<P, R> | undefined
  const fetch = action((...extraParams: E) => {
    if (clientCtx.mute($entry())) {
      return Promise.resolve() as Promise<undefined>
    }

    const key = $key()
    const params = $params()
    const queryCtx = prevQueryCtx = new QueryContext<P, R>(key, prevQueryCtx)
    let rev: number | undefined

    return clientCtx.run(
      queryCtx,
      () => {
        rev = clientCtx.loading(key)

        return fn(...params, ...extraParams, queryCtx)
      },
      (data, error) => clientCtx.settled(key, data, error, rev)
    )
  })

  clientCtx.task = promise => task($data, promise)

  onStart($data, () => effectScope(() => {
    if (auto) {
      effect(() => {
        $rev()
        $params()
        clientCtx.$disabled?.()
        auto(fetch)
      })
    }

    clientCtx.mounted()
  }))

  return [clientCtx, fetch, $data, $error, $loading, $key] as const
}
