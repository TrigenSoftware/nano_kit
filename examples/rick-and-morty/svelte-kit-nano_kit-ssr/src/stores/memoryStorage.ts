import type {
  CacheKey,
  CacheShardKey,
  CacheEntry,
  Storage
} from '@nano_kit/query'

interface StoredEntry {
  data: CacheEntry
  expires: number
}

/**
 * In-memory adapter using a Map of Maps.
 * @returns In-memory storage implementation.
 */
/* @__NO_SIDE_EFFECTS__ */
export function memoryStorage(): Storage {
  const shards = new Map<string, Map<string, StoredEntry>>()

  return {
    get(key: CacheKey) {
      const shard = shards.get(key.shard)

      if (!shard) {
        return Promise.resolve(null)
      }

      const entry = shard.get(key.key)

      if (!entry) {
        return Promise.resolve(null)
      }

      const now = Date.now()

      if (entry.expires < now || entry.data.expires < now) {
        shard.delete(key.key)

        if (!shard.size) {
          shards.delete(key.shard)
        }

        return Promise.resolve(null)
      }

      return Promise.resolve(entry.data)
    },
    set(cacheKey: CacheKey, entry: CacheEntry, lifetime: number) {
      let shard = shards.get(cacheKey.shard)

      if (!shard) {
        shard = new Map()
        shards.set(cacheKey.shard, shard)
      }

      shard.set(cacheKey.key, {
        data: entry,
        expires: Date.now() + lifetime
      })

      return Promise.resolve()
    },
    delete(cacheKey: CacheShardKey | CacheKey) {
      if (cacheKey.key === undefined) {
        shards.delete(cacheKey.shard)
      } else {
        const shard = shards.get(cacheKey.shard)

        if (shard) {
          shard.delete(cacheKey.key)

          if (!shard.size) {
            shards.delete(cacheKey.shard)
          }
        }
      }

      return Promise.resolve()
    }
  }
}
