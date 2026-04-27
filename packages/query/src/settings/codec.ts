import {
  type AnyCodec,
  identity
} from '@nano_kit/store'
import type { ClientSetting } from '../client.types.js'
import type {
  CacheEntry,
  EncodedCacheEntry
} from '../CacheStorage.types.js'

function mapEntry(
  entry: CacheEntry | EncodedCacheEntry,
  mapDetail: (data: number | string) => number | string,
  mapData: (data: unknown) => unknown
) {
  return {
    ...entry,
    data: mapData(entry.data),
    rev: mapDetail(entry.rev),
    dedupes: mapDetail(entry.dedupes),
    expires: mapDetail(entry.expires)
  }
}

export function encodeEntryData<T extends CacheEntry | EncodedCacheEntry>(entry: T, codec: AnyCodec) {
  return mapEntry(entry, identity, codec.encode) as T
}

export function decodeEntryData<T extends CacheEntry | EncodedCacheEntry>(entry: T, codec: AnyCodec) {
  return mapEntry(entry, identity, codec.decode) as T
}

export function encodeEntryDetails(entry: CacheEntry) {
  return mapEntry(entry, String, identity) as EncodedCacheEntry
}

export function decodeEntryDetails(entry: EncodedCacheEntry) {
  return mapEntry(entry, Number, identity) as CacheEntry
}

export function encodeEntry(entry: CacheEntry, codec: AnyCodec) {
  return mapEntry(entry, String, codec.encode) as EncodedCacheEntry
}

export function decodeEntry(entry: EncodedCacheEntry, codec: AnyCodec) {
  return mapEntry(entry, Number, codec.decode) as CacheEntry
}

/**
 * Set cache entry data codec for query client.
 * @param codec - Codec used to encode and decode cached data.
 * @returns The client setting function.
 */
/* @__NO_SIDE_EFFECTS__ */
export function codec(codec: AnyCodec): ClientSetting {
  return (ctx) => {
    ctx.codec = codec
  }
}
