import {
  type FalsyValue,
  type Mountable,
  type ReadableSignal,
  action,
  computed,
  signal,
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
  type SignalishParams,
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
 * @param next - A function to determine the next cursor from the last page, or a falsy value, like `undefined`, `null` or `false`, when there is no next page.
 * @param fn - The fetcher function that returns a promise of the data.
 * @param settings - Optional settings for the query.
 * @returns A tuple containing the fetchNext function and signals for data, error, loading state,
 * error and loading state of the next page alone, and the cache key.
 */
export function infinite<
  P extends unknown[],
  C,
  R
>(
  key: CacheKeyBuilder<P, InfinitePages<R, C>>,
  params: SignalishParams<P>,
  next: (lastPage: R) => C | FalsyValue,
  fn: (...args: [...P, cursor: C | undefined, queryCtx: QueryContext<P, InfinitePages<R, C>>]) => Promise<R>,
  settings?: ClientSetting<QueryClientContext<InfinitePages<R, C>>>[]
): readonly [
  fetchNext: () => Promise<readonly [InfinitePages<R, C> | undefined, unknown] | undefined>,
  $data: Mountable<ReadableSignal<InfinitePages<R, C> | null>>,
  $error: ReadableSignal<string | null>,
  $loading: ReadableSignal<boolean>,
  $nextError: ReadableSignal<string | null>,
  $nextLoading: ReadableSignal<boolean>,
  $key: ReadableSignal<CacheKey<P, InfinitePages<R, C>>>
]

/**
 * Create an infinite query that fetches paginated data with cache management.
 * @param key - The cache key builder.
 * @param params - The signal parameters for the query.
 * @param next - A function to determine the next cursor from the last page, or a falsy value, like `undefined`, `null` or `false`, when there is no next page.
 * @param fn - The fetcher function that returns a promise of the data.
 * @param settings - Optional settings for the query.
 * @returns A tuple containing the fetchNext function and signals for data, error, loading state,
 * error and loading state of the next page alone, and the cache key.
 */
export function infinite<
  P extends unknown[],
  C,
  R
>(
  key: CacheKeyBuilder<P, InfinitePages<R, C>>,
  params: SignalishParams<P>,
  next: (lastPage: R) => C | FalsyValue,
  fn: (...args: [...P, cursor: C | undefined]) => Promise<R>,
  settings?: ClientSetting<QueryClientContext<InfinitePages<R, C>>>[]
): readonly [
  fetchNext: () => Promise<readonly [InfinitePages<R, C> | undefined, unknown] | undefined>,
  $data: Mountable<ReadableSignal<InfinitePages<R, C> | null>>,
  $error: ReadableSignal<string | null>,
  $loading: ReadableSignal<boolean>,
  $nextError: ReadableSignal<string | null>,
  $nextLoading: ReadableSignal<boolean>,
  $key: ReadableSignal<CacheKey<P, InfinitePages<R, C>>>
]

/* @__NO_SIDE_EFFECTS__ */
export function infinite<P extends unknown[], C, R>(
  this: ClientContext,
  key: CacheKeyBuilder<P, InfinitePages<R, C>>,
  params: SignalishParams<P>,
  next: (lastPage: R) => C | FalsyValue,
  fn: (...args: [...P, cursor: C | undefined, queryCtx: QueryContext<P, InfinitePages<R, C>>]) => Promise<R>,
  settings?: ClientSetting<QueryClientContext<InfinitePages<R, C>>>[]
) {
  // The request of the list that runs or ran last is for the next page
  const $nextRequest = signal(false)
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
    const pages: R[] = []
    // From the first page, as many pages as are loaded: a list asked again keeps its length
    let count = cursor === undefined && (clientCtx.$get(queryCtx).data as InfinitePages<R, C> | null)?.pages.length || 1
    let nextValue = cursor
    let firstCtx: object | undefined

    // Only a request with a cursor loads the next page: a refetch from the first page is not one
    $nextRequest(cursor !== undefined)

    try {
      do {
        (args as unknown[])[args.length - 2] = nextValue

        const page = await fn(...args)

        // One request, one set of callbacks: the context stays as the first page left it.
        // Its own fields alone are kept, to be put back, so the prototype is not needed
        firstCtx ??= {
          // oxlint-disable-next-line typescript/no-misused-spread
          ...queryCtx
        }
        pages.push(page)
        nextValue = next(page) || undefined
      } while (--count && nextValue)
    } finally {
      Object.assign(queryCtx, firstCtx)
    }

    // The pages as they are by now: what was written while the page loaded stays
    const data = clientCtx.$get(queryCtx).data as InfinitePages<R, C> | null

    return {
      pages: cursor === undefined
        ? pages
        : [...data?.pages || [], ...pages],
      next: nextValue,
      more: Boolean(nextValue)
    }
  }, settings)
  const initialTimeDedupe = clientCtx.timeDedupe
  const $nextError = computed(() => ($nextRequest() ? $error() : null))
  const $nextLoading = computed(() => $nextRequest() && $loading())
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

  return [fetchNext, $data, $error, $loading, $nextError, $nextLoading, $key] as const
}
