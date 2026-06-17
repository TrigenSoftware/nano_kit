import type { NewValue } from '@nano_kit/store'
import type {
  CacheMap,
  CacheShardKey,
  CacheKey,
  CacheEntry
} from './CacheStorage.types.js'
import {
  hasShardedMapKey,
  $getShardedMapKey,
  setShardedMapKey,
  deleteShardedMapKey
} from './map.js'

export type * from './CacheStorage.types.js'

export const DEFAULT_DEDUPE_TIME = 4_000
export const DEFAULT_CACHE_TIME = Infinity
export const UNSET_REV = Infinity

/*
REV
< 0 = locked, do not fetch
0 = unset, need to fetch
> 0 = current revision, used to identify latest fetch
*/

/* @__NO_SIDE_EFFECTS__ */
export function revLock(rev: number) {
  return rev > 0 ? rev * -1 : rev
}

/* @__NO_SIDE_EFFECTS__ */
export function revLocked(rev: number) {
  return rev < 0
}

let revCounter = 0

export class CacheStorage {
  dedupeTime = DEFAULT_DEDUPE_TIME
  cacheTime = DEFAULT_CACHE_TIME
  cache: CacheMap = new Map()

  initial() {
    return {
      rev: UNSET_REV,
      dedupes: 0,
      expires: 0,
      data: null,
      error: null,
      loading: false
    }
  }

  $get(key: CacheKey) {
    const cache = this.cache

    if (!hasShardedMapKey(cache, key)) {
      setShardedMapKey(cache, key, this.initial())
    }

    const result = $getShardedMapKey(cache, key)!

    return result
  }

  set(
    key: CacheShardKey | CacheKey,
    entry: NewValue<CacheEntry | undefined>
  ) {
    setShardedMapKey(this.cache, key, entry)
  }

  /**
   * Invalidate cache entry for the given key.
   * If shard key is used, invalidate all entries in the shard.
   * @param key - The cache key to invalidate.
   */
  invalidate(key: CacheShardKey | CacheKey) {
    deleteShardedMapKey(this.cache, key)
  }

  /**
   * Revalidate cache entry for the given key.
   * If shard key is used, revalidate all entries in the shard.
   * @param key - The cache key to revalidate.
   */
  revalidate(key: CacheShardKey | CacheKey) {
    if (key.key === undefined || hasShardedMapKey(this.cache, key)) {
      this.set(key, entry => ({
        ...entry!,
        rev: UNSET_REV,
        dedupes: 0
      }))
    }
  }

  mute(entry: CacheEntry, loadingDedupe = true, timeDedupe = true) {
    return (
      loadingDedupe && entry.loading
      || timeDedupe && entry.dedupes > Date.now()
      || revLocked(entry.rev)
    )
  }

  loading(key: CacheKey) {
    const rev = ++revCounter

    this.set(key, (entry = this.initial()) => ({
      ...entry,
      rev,
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
    rev?: number
  ) {
    const now = Date.now()

    this.set(key, (entry = this.initial()) => (
      rev !== undefined && rev !== entry.rev
        ? entry
        : {
          ...entry,
          dedupes: now + this.dedupeTime,
          expires: now + this.cacheTime,
          data: error === null ? data : entry.data,
          error,
          loading: false
        }
    ))
  }
}
