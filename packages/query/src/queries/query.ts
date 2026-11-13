import type {
  Mountable,
  ReadableSignal
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
  type SignalishParams,
  baseQuery
} from './base.js'

/**
 * Create a query that automatically fetches data when parameters change with cache management.
 * @param key - The cache key builder.
 * @param params - The signal parameters for the query.
 * @param fn - The fetcher function that returns a promise of the data.
 * @param settings - Optional settings for the query.
 * @returns A tuple containing signals for data, error, loading state, and the cache key.
 */
export function query<
  P extends unknown[],
  R
>(
  key: CacheKeyBuilder<P, R>,
  params: SignalishParams<P>,
  fn: (...args: [...P, queryCtx: QueryContext<P, R>]) => Promise<R>,
  settings?: ClientSetting<QueryClientContext<P, R>>[]
): readonly [
  $data: Mountable<ReadableSignal<R | null>>,
  $error: ReadableSignal<string | null>,
  $loading: ReadableSignal<boolean>,
  $key: ReadableSignal<CacheKey<P, R>>
]

/**
 * Create a query that automatically fetches data when parameters change with cache management.
 * @param key - The cache key builder.
 * @param params - The signal parameters for the query.
 * @param fn - The fetcher function that returns a promise of the data.
 * @param settings - Optional settings for the query.
 * @returns A tuple containing signals for data, error, loading state, and the cache key.
 */
export function query<
  P extends unknown[],
  R
>(
  key: CacheKeyBuilder<P, R>,
  params: SignalishParams<P>,
  fn: (...args: P) => Promise<R>,
  settings?: ClientSetting<QueryClientContext<P, R>>[]
): readonly [
  $data: Mountable<ReadableSignal<R | null>>,
  $error: ReadableSignal<string | null>,
  $loading: ReadableSignal<boolean>,
  $key: ReadableSignal<CacheKey<P, R>>
]

/* @__NO_SIDE_EFFECTS__ */
export function query<P extends unknown[], R>(
  this: ClientContext,
  key: CacheKeyBuilder<P, R>,
  params: SignalishParams<P>,
  fn: (...args: [...P, queryCtx: QueryContext<P, R>]) => Promise<R>,
  settings?: ClientSetting<QueryClientContext<P, R>>[]
) {
  const [, , ...signals] = baseQuery<P, [], R>(this, key, params, fn, settings, fetch => fetch())

  return signals
}
