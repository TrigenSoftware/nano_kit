import {
  type AnyAccessor,
  type Hydrator,
  Hydrator$,
  Hydratables$,
  inject
} from '@nano_kit/store'
import type { ClientSetting } from '../client.types.js'
import type { ClientContext } from '../ClientContext.js'
import type {
  CacheMap,
  CacheEntry
} from '../CacheStorage.types.js'
import { setShardedMapKey } from '../map.js'

interface HydratableContext extends ClientContext {
  hydratable?: boolean
}

type SerializedShardedMap = [string, string, CacheEntry][]

const id = '@nano_kit/query'

function serialize(cache: CacheMap) {
  const serialized: SerializedShardedMap = []

  cache.forEach((shard, shardKey) => {
    shard.forEach(($signal, key) => {
      const value = $signal?.()

      if (value !== undefined) {
        serialized.push([shardKey, key, value])
      }
    })
  })

  return serialized
}

function deserialize(cache: CacheMap, serialized: SerializedShardedMap) {
  serialized.forEach(([shard, key, value]) => {
    setShardedMapKey(cache, {
      shard,
      key
    }, value)
  })
}

/**
 * Make client cache hydratable.
 * Without arguments, it will try to inject {@link Hydrator$} and {@link Hydratables$} from the injection context.
 * @param hydrator - Optional hydrator to use for rehydrating the cache. Pass `null` to skip hydration and only register for dehydration.
 * @param hydratables - Optional map to register the cache serializer for dehydration.
 * @returns The client setting function.
 */
/* @__NO_SIDE_EFFECTS__ */
export function hydratable(
  hydrator?: Hydrator | null,
  hydratables?: Map<string, AnyAccessor> | null
): ClientSetting {
  return (ctx: HydratableContext) => {
    if (!ctx.hydratable) {
      const hydrate = hydrator === undefined
        ? inject(Hydrator$)
        : hydrator

      if (hydrate) {
        hydrate(id, (value) => {
          deserialize(ctx.cache, value as SerializedShardedMap)
        })
      } else {
        const finalHydratables = hydratables === undefined
          ? inject(Hydratables$)
          : hydratables

        if (finalHydratables) {
          finalHydratables.set(id, () => serialize(ctx.cache))
        }
      }
    }

    ctx.hydratable = true
  }
}
