import {
  type NewValue,
  isFunction
} from '@nano_kit/store'
import type {
  CacheKeyBuilder,
  CacheDataFacade,
  CacheKey,
  ExtrasCacheKeyBuilder
} from './cache.types.js'
import type { CacheStorage } from './CacheStorage.js'

export * from './cache.types.js'

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
  const key = ((...params: Partial<P>) => ({
    shard: name,
    key: JSON.stringify(filter(params))
  })) as CacheKeyBuilder<P, R>

  key.shard = name
  key.key = undefined

  return key
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

/**
 * Create cache getter/setter for data.
 * @param cache - The cache map.
 * @returns The data getter/setter.
 */
/* @__NO_SIDE_EFFECTS__ */
export function dataCacheFacade(cache: CacheStorage) {
  return dataCacheGetterSetter.bind(cache) as CacheDataFacade
}

function dataCacheGetterSetter<P extends unknown[], R>(
  this: CacheStorage,
  key: CacheKey<P, R>,
  ...value: [NewValue<R | null>]
) {
  if (value.length) {
    const newValue = value[0]

    this.set(key, (entry = this.initial()) => ({
      ...entry,
      data: isFunction(newValue)
        ? (newValue as (value: unknown) => unknown)(entry.data)
        : newValue
    }))
  } else {
    return this.$get(key).data as R | null
  }
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
 * @returns The error state getter.
 */
/* @__NO_SIDE_EFFECTS__ */
export function errorCacheFacade(cache: CacheStorage) {
  return (key: CacheKey) => cache.$get(key).error
}
