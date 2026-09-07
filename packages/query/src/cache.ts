import {
  assignKey,
  batch,
  nextValue
} from '@nano_kit/store'
import type {
  CacheKeyBuilder,
  AnyCacheKeyBuilder,
  CacheDataFacade,
  CacheErrorFacade,
  CacheKey,
  ExtrasCacheKeyBuilder,
  NewData
} from './cache.types.js'
import type {
  CacheEntry,
  CacheStorage
} from './CacheStorage.js'

export type * from './cache.types.js'

const keysSet = new Set<AnyCacheKeyBuilder>()

/**
 * Create a query cache key builder.
 * @param name - The cache shard name.
 * @param filter - Optional filter to process parameters before building the key.
 * @returns The cache key builder.
 */
/* @__NO_SIDE_EFFECTS__ */
export function queryKey<P extends unknown[], R>(
  name: string,
  filter: (params: Partial<P>) => unknown[] = params => params
) {
  if (import.meta.env.DEV) {
    const originalFilter = filter

    filter = (params) => {
      const filtered = originalFilter(params)

      for (const param of filtered) {
        const type = typeof param

        if (type === 'function' || type === 'symbol') {
          console.warn(`[nano_kit/query] A "${name}" cache key parameter is a ${type}: it serializes to null in the key, filter it out or map it to a serializable value`)
        }
      }

      return filtered
    }
  }

  const key = ((...params: Partial<P>) => ({
    shard: name,
    key: JSON.stringify(filter(params)),
    params
  })) as CacheKeyBuilder<P, R>

  if (import.meta.env.DEV) {
    for (const registered of keysSet) {
      if (registered.shard === name) {
        console.warn(`[nano_kit/query] Cache key shard "${name}" is already registered: two builders with one name share one cache`)
        break
      }
    }
  }

  key.shard = name
  key.key = undefined

  keysSet.add(key)

  return key
}

/**
 * Iterate over all cache key builders and call the provided callback with each key.
 * Iteration is batched to avoid unnecessary reactivity triggers.
 * @param callback - The callback function to be called with each cache key builder.
 */
export function keys(callback: (key: AnyCacheKeyBuilder) => void) {
  batch(() => keysSet.forEach(callback))
}

/**
 * Create an operation cache key builder with extra parameters.
 * @param name - The cache shard name.
 * @param filter - Optional filter to process parameters before building the key.
 * @returns The extras cache key builder.
 */
/* @__NO_SIDE_EFFECTS__ */
export function operationKey<
  P extends unknown[],
  E extends unknown[],
  R
>(
  name: string,
  filter?: (params: Partial<P>) => unknown[]
) {
  return queryKey<P, R>(name, filter) as ExtrasCacheKeyBuilder<P, E, R>
}

function cacheGetterSetter<F extends 'data' | 'error', P extends unknown[], R>(
  this: CacheStorage,
  field: F,
  key: CacheKey<P, R>,
  ...value: [NewData<P, CacheEntry<P, R>[F]>]
) {
  if (value.length) {
    const newValue = value[0]
    let prevEntry: CacheEntry

    this.set(key, (entry = this.initial()) => {
      prevEntry = entry

      return assignKey(entry, field, nextValue(
        entry[field] as CacheEntry<P, R>[F],
        newValue,
        entry.params as P
      ))
    })

    return () => this.set(
      key,
      (entry = prevEntry) => assignKey(entry, field, prevEntry[field])
    )
  }

  return this.$get(key)[field] as CacheEntry<P, R>[F]
}

/**
 * Create cache getter/setter for data.
 * @param cache - The cache map.
 * @returns The data getter/setter.
 */
/* @__NO_SIDE_EFFECTS__ */
export function dataCacheFacade(cache: CacheStorage) {
  return cacheGetterSetter.bind(cache, 'data') as CacheDataFacade
}

/**
 * Create cache getter for loading state.
 * @param cache - The cache map.
 * @returns The loading state getter.
 */
/* @__NO_SIDE_EFFECTS__ */
export function loadingCacheFacade(cache: CacheStorage) {
  return (key: CacheKey) => cache.$get(key).loading
}

/**
 * Create cache getter for error state.
 * @param cache - The cache map.
 * @returns The error state getter/setter.
 */
/* @__NO_SIDE_EFFECTS__ */
export function errorCacheFacade(cache: CacheStorage) {
  return cacheGetterSetter.bind(cache, 'error') as CacheErrorFacade
}
