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
  CacheEntry,
  SerializedCacheEntry
} from '../CacheStorage.types.js'
import { setShardedMapKey } from '../map.js'

interface HydratableContext extends ClientContext {
  hydratable?: boolean
}

type SerializedShardedMap = [string, string, SerializedCacheEntry][]

const id = '@nano_kit/query'

function mapEntry(
  entry: CacheEntry,
  map: StringConstructor
): SerializedCacheEntry

function mapEntry(
  entry: SerializedCacheEntry,
  map: NumberConstructor
): CacheEntry

function mapEntry(
  entry: CacheEntry | SerializedCacheEntry,
  map: StringConstructor | NumberConstructor
) {
  return {
    ...entry,
    rev: map(entry.rev),
    dedupes: map(entry.dedupes),
    expires: map(entry.expires)
  }
}

function serialize(cache: CacheMap) {
  const serialized: SerializedShardedMap = []

  cache.forEach((shard, shardKey) => {
    shard.forEach(($signal, key) => {
      const value = $signal?.()

      if (value !== undefined) {
        serialized.push([shardKey, key, mapEntry(value, String)])
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
    }, mapEntry(value, Number))
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
      const finalHydrator = hydrator === undefined
        ? inject(Hydrator$)
        : hydrator

      if (finalHydrator) {
        finalHydrator.pull(id, (value) => {
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
