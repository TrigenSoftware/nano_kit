import type {
  ShardedSignalsMap,
  ShardKey,
  ShardedKey
} from './map.js'

export interface CacheEntry<P extends readonly unknown[] = readonly unknown[], R = unknown> {
  rev: number
  dedupes: number
  expires: number
  params: P
  data: R | null
  error: string | null
  loading: boolean
}

export interface EncodedCacheEntry extends Omit<CacheEntry, 'rev' | 'dedupes' | 'expires'> {
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
  params: P
  // Only types info:
  R: R
}
