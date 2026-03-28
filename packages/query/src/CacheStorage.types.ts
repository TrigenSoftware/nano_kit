import type {
  ShardedSignalsMap,
  ShardKey,
  ShardedKey
} from './map.js'

export interface CacheEntry<T = unknown> {
  rev: number
  dedupes: number
  expires: number
  data: T | null
  error: string | null
  loading: boolean
}

export interface SerializedCacheEntry extends Omit<CacheEntry, 'rev' | 'dedupes' | 'expires'> {
  rev: string
  dedupes: string
  expires: string
}

export type CacheMap = ShardedSignalsMap<string, string, CacheEntry>

export interface CacheShardKey<
  P extends unknown[] = unknown[],
  R = unknown
> extends ShardKey<string> {
  // Only types info:
  P: P
  R: R
}

export interface CacheKey<
  P extends unknown[] = unknown[],
  R = unknown
> extends ShardedKey<string, string> {
  // Only types info:
  P: P
  R: R
}
