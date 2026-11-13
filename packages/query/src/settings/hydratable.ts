import {
  type AnyAccessor,
  type Hydrator,
  Hydrator$,
  Hydratables$,
  inject
} from '@nano_kit/store'
import type { ClientSetting } from '../client.types.js'
import type { ClientContext } from '../ClientContext.js'
import type { EncodedCacheEntry } from '../CacheStorage.types.js'
import {
  encodeEntry,
  decodeEntry
} from './codec.js'

interface HydratableContext extends ClientContext {
  hydratable?: boolean
}

type EncodedShardedMap = [string, string, EncodedCacheEntry][]

const id = '@nano_kit/query'

function encode({
  cache,
  codec
}: HydratableContext) {
  const encoded: EncodedShardedMap = []

  cache.forEach((shard, shardKey) => {
    for (const key of shard.keys()) {
      encoded.push([shardKey, key, encodeEntry(shard.get(key)!, codec)])
    }
  })

  return encoded
}

function decode(
  {
    cache,
    codec,
    dedupeTime
  }: HydratableContext,
  encoded: EncodedShardedMap
) {
  encoded.forEach(([shard, key, value]) => {
    const entry = decodeEntry(value, codec)

    // A request in flight on the server does not go on here, so it is made again
    entry.loading = false

    // An error the server rendered is on the page already: it stays, as an answer would,
    // rather than asked again as the page hydrates
    if (entry.error) {
      entry.dedupes = Date.now() + dedupeTime
    }

    cache.set({
      shard,
      key
    }, entry)
  })
}

/**
 * Make client cache hydratable.
 * Without arguments, it will try to resolve {@link Hydrator$} and {@link Hydratables$} from the injection context.
 * @param hydrator - Optional hydrator to use for rehydrating the cache. Pass `null` to skip hydration and only register for dehydration.
 * @param hydratables - Optional map to register the cache collector for dehydration.
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
        finalHydrator.pull(id, value => decode(ctx, value as EncodedShardedMap))
      } else {
        const finalHydratables = hydratables === undefined
          ? inject(Hydratables$)
          : hydratables

        if (finalHydratables) {
          finalHydratables.set(id, () => encode(ctx))
        }
      }
    }

    ctx.hydratable = true
  }
}
