import { untracked } from '@nano_kit/store'
import type { ClientSetting } from '../client.types.js'
import type {
  CacheKey,
  CacheShardKey,
  CacheEntry
} from '../CacheStorage.types.js'
import type { QueryClientContext } from '../ClientContext.js'
import { revLock, revLocked, UNSET_REV } from '../CacheStorage.js'
import { hasShardedMapKey } from '../map.js'

interface PersistenceContext extends QueryClientContext {
  persistenceLifetime?: number
}

export interface Storage {
  get(key: CacheKey): Promise<CacheEntry | null>
  set(key: CacheKey, entry: CacheEntry, lifetime: number): Promise<void>
  delete(key: CacheShardKey | CacheKey): Promise<void>
}

/**
 * Generic persistent storage client setting.
 * @param storage - The storage implementation to use for persistence.
 * @param lifetime - How long to keep entries in storage in milliseconds.
 * @returns The client setting function.
 */
/* @__NO_SIDE_EFFECTS__ */
export function persistence(storage: Storage | null, lifetime: number): ClientSetting<QueryClientContext> {
  return (ctx: PersistenceContext) => {
    if (!storage) {
      return
    }

    if (ctx.persistenceLifetime === undefined) {
      const superGet = ctx.$get
      const superSet = ctx.set
      const superInvalidate = ctx.invalidate

      ctx.$get = function (key) {
        const cache = this.cache
        const hasKey = hasShardedMapKey(cache, key)
        const entry = superGet.call(this, key)

        if (hasKey) {
          return entry
        }

        superSet.call(this, key, {
          ...entry,
          rev: revLock(entry.rev)
        })

        void this.task(storage.get(key).then(storedEntry => superSet.call(this, key, {
          ...entry,
          ...storedEntry,
          rev: UNSET_REV
        })))

        return superGet.call(this, key)
      }

      function saveSingleEntry(
        this: PersistenceContext,
        key: CacheKey
      ) {
        const entry = untracked(superGet.bind(this, key))

        if (entry && !entry.loading && !entry.error && !revLocked(entry.rev)) {
          void this.task(storage!.set(key, entry, this.persistenceLifetime!))
        }
      }

      ctx.set = function (cacheKey, entry) {
        superSet.call(this, cacheKey, entry)

        const {
          shard,
          key
        } = cacheKey

        if (key !== undefined) {
          saveSingleEntry.call(this, cacheKey)
        } else {
          const shardMap = this.cache.get(shard)

          if (shardMap) {
            for (const key of shardMap.keys()) {
              saveSingleEntry.call(this, {
                shard,
                key
              } as CacheKey)
            }
          }
        }
      }

      ctx.invalidate = function (key) {
        superInvalidate.call(this, key)
        void this.task(storage.delete(key))
      }
    }

    ctx.persistenceLifetime = lifetime
  }
}
