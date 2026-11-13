import type { NewValue } from '@nano_kit/store'
import type {
  CacheMap,
  CacheShardKey,
  CacheKey,
  CacheEntry
} from './CacheStorage.types.js'
import { ShardedSignalsMap } from './map.js'

export type * from './CacheStorage.types.js'

export const DEFAULT_DEDUPE_TIME = 4_000
export const DEFAULT_CACHE_TIME = Infinity
export const UNSET_REV = Infinity

/*
REV
< 0 = locked, do not fetch
Infinity = unset, need to fetch
> 0 = current revision, used to identify latest fetch
*/

let revCounter = 0

export class CacheStorage {
  dedupeTime = DEFAULT_DEDUPE_TIME
  cacheTime = DEFAULT_CACHE_TIME
  cache: CacheMap = new ShardedSignalsMap()

  initial() {
    return {
      rev: UNSET_REV,
      dedupes: 0,
      // No answer yet, so nothing to expire: data written before the first one stays while it loads
      expires: Infinity,
      params: [],
      data: null,
      error: null,
      loading: false
    }
  }

  $get(key: CacheKey) {
    const cache = this.cache

    if (!cache.has(key)) {
      cache.set(key, this.initial())
    }

    return cache.$get(key)!
  }

  set(
    key: CacheShardKey | CacheKey,
    entry: NewValue<CacheEntry | undefined, string | undefined>
  ) {
    this.cache.set(key, entry)
  }

  /**
   * Invalidate cache entry for the given key.
   * If shard key is used, invalidate all entries in the shard.
   * @param key - The cache key to invalidate.
   */
  invalidate(key: CacheShardKey | CacheKey) {
    this.cache.delete(key)
  }

  /**
   * Revalidate cache entry for the given key.
   * If shard key is used, revalidate all entries in the shard.
   * @param key - The cache key to revalidate.
   */
  revalidate(key: CacheShardKey | CacheKey) {
    // For a key of a shard `has` tells whether the shard is there
    if (this.cache.has(key)) {
      this.set(key, entry => ({
        ...entry!,
        rev: UNSET_REV,
        dedupes: 0
      }))
    }
  }

  mute(entry: CacheEntry, loadingDedupe: boolean, timeDedupe: boolean) {
    return (
      loadingDedupe && entry.loading && entry.rev !== UNSET_REV
      || timeDedupe && entry.dedupes > Date.now()
      || entry.rev < 0
    )
  }

  loading(key: CacheKey) {
    const rev = ++revCounter

    this.set(key, (entry = this.initial()) => ({
      ...entry,
      rev,
      params: key.params,
      data: entry.expires > Date.now() ? entry.data : null,
      error: null,
      loading: true
    }))

    return rev
  }

  settled(
    key: CacheKey,
    data: unknown,
    error: string | null,
    rev: number | undefined
  ) {
    const now = Date.now()

    this.set(key, (entry = this.initial()) => (
      // An answer to a request the entry is no longer waiting for is dropped
      rev !== entry.rev
        ? entry
        : {
          ...entry,
          // A failure is no answer to dedupe: the key is asked again once it is read again
          dedupes: error === null ? now + this.dedupeTime : 0,
          expires: now + this.cacheTime,
          params: key.params,
          data: error === null ? data : entry.data,
          error,
          loading: false
        }
    ))
  }
}
