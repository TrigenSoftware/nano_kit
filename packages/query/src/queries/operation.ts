import {
  type Mountable,
  type ReadableSignal,
  effectScope,
  onStart
} from '@nano_kit/store'
import type { ClientSetting } from '../client.types.js'
import type {
  CacheKey,
  CacheKeyBuilder,
  ExtrasCacheKeyBuilder
} from '../cache.types.js'
import type { QueryContext } from '../RequestContext.js'
import {
  type ClientContext,
  type QueryClientContext,
  dedupe
} from '../ClientContext.js'
import {
  type SignalishParams,
  baseQuery
} from './base.js'

/**
 * Create an operation that do requests on demand with cache management.
 * @param key - The cache key builder.
 * @param params - The signal parameters for the operation.
 * @param fn - The request function that returns a promise of the data.
 * @param settings - Optional settings for the operation.
 * @returns A tuple containing the fetch function and signals for data, error, loading state, and the cache key.
 */
export function operation<
  P extends unknown[],
  E extends unknown[],
  R
>(
  key: ExtrasCacheKeyBuilder<P, E, R>,
  params: SignalishParams<P>,
  fn: (...args: [...P, ...E, queryCtx: QueryContext<P, R>]) => Promise<R>,
  settings?: ClientSetting<QueryClientContext<R>>[]
): readonly [
  fetch: (...extraParams: E) => Promise<readonly [R | undefined, unknown] | undefined>,
  $data: Mountable<ReadableSignal<R | null>>,
  $error: ReadableSignal<string | null>,
  $loading: ReadableSignal<boolean>,
  $key: ReadableSignal<CacheKey<P, R>>
]

/**
 * Create an operation that do requests on demand with cache management.
 * @param key - The cache key builder.
 * @param params - The signal parameters for the operation.
 * @param fn - The request function that returns a promise of the data.
 * @param settings - Optional settings for the operation.
 * @returns A tuple containing the fetch function and signals for data, error, loading state, and the cache key.
 */
export function operation<
  P extends unknown[],
  E extends unknown[],
  R
>(
  key: ExtrasCacheKeyBuilder<P, E, R>,
  params: SignalishParams<P>,
  fn: (...args: [...P, ...E]) => Promise<R>,
  settings?: ClientSetting<QueryClientContext<R>>[]
): readonly [
  fetch: (...extraParams: E) => Promise<readonly [R | undefined, unknown] | undefined>,
  $data: Mountable<ReadableSignal<R | null>>,
  $error: ReadableSignal<string | null>,
  $loading: ReadableSignal<boolean>,
  $key: ReadableSignal<CacheKey<P, R>>
]

/**
 * Create an operation that do requests on demand with cache management.
 * @param key - The cache key builder.
 * @param params - The signal parameters for the operation.
 * @param fn - The request function that returns a promise of the data.
 * @param settings - Optional settings for the operation.
 * @returns A tuple containing the fetch function and signals for data, error, loading state, and the cache key.
 */
export function operation<
  P extends unknown[],
  R
>(
  key: CacheKeyBuilder<P, R>,
  params: SignalishParams<P>,
  fn: (...args: [...P, queryCtx: QueryContext<P, R>]) => Promise<R>,
  settings?: ClientSetting<QueryClientContext<R>>[]
): readonly [
  fetch: () => Promise<readonly [R | undefined, unknown] | undefined>,
  $data: Mountable<ReadableSignal<R | null>>,
  $error: ReadableSignal<string | null>,
  $loading: ReadableSignal<boolean>,
  $key: ReadableSignal<CacheKey<P, R>>
]

/**
 * Create an operation that do requests on demand with cache management.
 * @param key - The cache key builder.
 * @param params - The signal parameters for the operation.
 * @param fn - The request function that returns a promise of the data.
 * @param settings - Optional settings for the operation.
 * @returns A tuple containing the fetch function and signals for data, error, loading state, and the cache key.
 */
export function operation<
  P extends unknown[],
  R
>(
  key: CacheKeyBuilder<P, R>,
  params: SignalishParams<P>,
  fn: (...args: P) => Promise<R>,
  settings?: ClientSetting<QueryClientContext<R>>[]
): readonly [
  fetch: () => Promise<readonly [R | undefined, unknown] | undefined>,
  $data: ReadableSignal<R | null>,
  $error: ReadableSignal<string | null>,
  $loading: ReadableSignal<boolean>,
  $key: ReadableSignal<CacheKey<P, R>>
]

/* @__NO_SIDE_EFFECTS__ */
export function operation<
  P extends unknown[],
  E extends unknown[],
  R
>(
  this: ClientContext,
  key: CacheKeyBuilder<P, R>,
  params: SignalishParams<P>,
  fn: (...args: [...P, ...E, queryCtx: QueryContext<P, R>]) => Promise<R>,
  settings: ClientSetting<QueryClientContext<R>>[] = []
) {
  const {
    clientCtx,
    fetch,
    $key,
    $data,
    $error,
    $loading
  } = baseQuery<P, E, R>(this, key, params, fn, [dedupe(true, false), ...settings])

  onStart($data, () => effectScope(() => clientCtx.mounted()))

  return [fetch, $data, $error, $loading, $key] as const
}
