import {
  type Mountable,
  type ReadableSignal,
  action,
  effect,
  effectScope,
  onStart
} from '@nano_kit/store'
import type { ClientSetting } from '../client.types.js'
import type {
  CacheKey,
  CacheKeyBuilder
} from '../cache.types.js'
import type {
  ClientContext,
  QueryClientContext
} from '../ClientContext.js'
import type { QueryContext } from '../RequestContext.js'
import {
  type SignalsParams,
  baseQuery
} from './base.js'

export interface InfinitePages<P, C> {
  pages: P[]
  next: C | undefined
  more: boolean
}

/**
 * Create an infinite query that fetches paginated data with cache management.
 * @param key - The cache key builder.
 * @param params - The signal parameters for the query.
 * @param next - A function to determine the next cursor from the last page.
 * @param fn - The fetcher function that returns a promise of the data.
 * @param settings - Optional settings for the query.
 * @returns A tuple containing the fetchNext function and signals for data, error, loading state, and the cache key.
 */
export function infinite<
  P extends unknown[],
  C,
  R
>(
  key: CacheKeyBuilder<P, InfinitePages<R, C>>,
  params: SignalsParams<P>,
  next: (lastPage: R) => C | undefined,
  fn: (...args: [...P, cursor: C | undefined, queryCtx: QueryContext<P, InfinitePages<R, C>>]) => Promise<R>,
  settings?: ClientSetting<QueryClientContext<InfinitePages<R, C>>>[]
): readonly [
  fetchNext: () => Promise<readonly [InfinitePages<R, C> | undefined, unknown] | undefined>,
  $data: Mountable<ReadableSignal<InfinitePages<R, C> | null>>,
  $error: ReadableSignal<string | null>,
  $loading: ReadableSignal<boolean>,
  $key: ReadableSignal<CacheKey<P, InfinitePages<R, C>>>
]

/**
 * Create an infinite query that fetches paginated data with cache management.
 * @param key - The cache key builder.
 * @param params - The signal parameters for the query.
 * @param next - A function to determine the next cursor from the last page.
 * @param fn - The fetcher function that returns a promise of the data.
 * @param settings - Optional settings for the query.
 * @returns A tuple containing the fetchNext function and signals for data, error, loading state, and the cache key.
 */
export function infinite<
  P extends unknown[],
  C,
  R
>(
  key: CacheKeyBuilder<P, InfinitePages<R, C>>,
  params: SignalsParams<P>,
  next: (lastPage: R) => C | undefined,
  fn: (...args: [...P, cursor: C | undefined]) => Promise<R>,
  settings?: ClientSetting<QueryClientContext<InfinitePages<R, C>>>[]
): readonly [
  fetchNext: () => Promise<readonly [InfinitePages<R, C> | undefined, unknown] | undefined>,
  $data: Mountable<ReadableSignal<InfinitePages<R, C> | null>>,
  $error: ReadableSignal<string | null>,
  $loading: ReadableSignal<boolean>,
  $key: ReadableSignal<CacheKey<P, InfinitePages<R, C>>>
]

/* @__NO_SIDE_EFFECTS__ */
export function infinite<P extends unknown[], C, R>(
  this: ClientContext,
  key: CacheKeyBuilder<P, InfinitePages<R, C>>,
  params: SignalsParams<P>,
  next: (lastPage: R) => C | undefined,
  fn: (...args: [...P, cursor: C | undefined, queryCtx: QueryContext<P, InfinitePages<R, C>>]) => Promise<R>,
  settings?: ClientSetting<QueryClientContext<InfinitePages<R, C>>>[]
) {
  const {
    clientCtx,
    fetch,
    $params,
    $key,
    $rev,
    $data,
    $error,
    $loading
  } = baseQuery<P, [cursor: C | undefined], InfinitePages<R, C>>(this, key, params, async (...args) => {
    const queryCtx = args[args.length - 1] as QueryContext<P, InfinitePages<R, C>>
    const cursor = args[args.length - 2] as C | undefined
    const data = clientCtx.$get(queryCtx).data as InfinitePages<R, C> | null
    const page = await fn(...args)
    const nextValue = next(page)

    return {
      pages: cursor === undefined
        ? [page]
        : [...data?.pages || [], page],
      next: nextValue,
      more: Boolean(nextValue)
    }
  }, settings)
  const initialTimeDedupe = clientCtx.timeDedupe
  const fetchNext = action(() => {
    const data = $data()

    if (!data?.more) {
      return Promise.resolve() as Promise<undefined>
    }

    clientCtx.timeDedupe = false

    return fetch(data.next)
  })

  onStart($data, () => effectScope(() => {
    effect(() => {
      $rev()
      $params()
      clientCtx.$disabled?.()
      clientCtx.timeDedupe = initialTimeDedupe
      void fetch(undefined)
    })

    clientCtx.mounted()
  }))

  return [fetchNext, $data, $error, $loading, $key] as const
}
