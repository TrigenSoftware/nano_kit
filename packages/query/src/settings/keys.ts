import { batch } from '@nano_kit/store'
import type { ClientExtension } from '../client.types.js'
import type { ClientContext } from '../ClientContext.js'
import type {
  CacheKey,
  CacheShardKey
} from '../CacheStorage.js'

interface KeysExtension {
  /**
   * Iterate over the cached keys of the cache key builder and call the provided callback with each key.
   * A key carries the parameters it was loaded with, so the callback can pick keys by them.
   * Iteration is batched to avoid unnecessary reactivity triggers.
   * @param key - The cache key builder.
   * @param callback - The callback function to be called with each cached key.
   */
  eachKey<P extends unknown[], R>(
    key: CacheShardKey<P, R>,
    callback: (key: CacheKey<P, R>) => void
  ): void
}

function eachKey(
  this: ClientContext,
  { shard }: CacheShardKey,
  callback: (key: CacheKey) => void
) {
  const map = this.cache.get(shard)

  if (map) {
    batch(() => {
      for (const key of map.keys()) {
        callback({
          shard,
          key,
          params: map.get(key)!.params
        } as CacheKey)
      }
    })
  }
}

/**
 * Extend client with iteration over cached keys.
 * @returns The client extension.
 */
/* @__NO_SIDE_EFFECTS__ */
export function keys() {
  return ((ctx, client) => {
    (client as KeysExtension).eachKey = eachKey.bind(ctx)

    return client
  }) as ClientExtension<KeysExtension>
}
