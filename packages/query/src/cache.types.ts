import type {
  CacheKey,
  CacheShardKey
} from './CacheStorage.types.js'

export type {
  CacheKey,
  CacheShardKey
}

export interface ExtrasCacheKey<
  P extends unknown[] = unknown[],
  E extends unknown[] = unknown[],
  R = unknown
> extends CacheKey<P, R> {
  // Only types info:
  E: E
}

export type CacheKeyBuilder<P extends unknown[], R> = (
  (...params: Partial<P>) => CacheKey<P, R>
) & CacheShardKey<P, R>

// oxlint-disable-next-line typescript/no-explicit-any
export type AnyCacheKeyBuilder = CacheKeyBuilder<any[], any>

export type ExtrasCacheKeyBuilder<
  P extends unknown[],
  E extends unknown[],
  R
> = (
  (...params: Partial<P>) => ExtrasCacheKey<P, E, R>
) & CacheShardKey<P, R>

export type NewData<P extends readonly unknown[], R> = R | ((data: R, params: P) => R)

export interface CacheDataFacade {
  <P extends unknown[], R>(key: CacheKey<P, R>): R | null
  <P extends unknown[], R>(key: CacheShardKey<P, R> | CacheKey<P, R>, value: NewData<P, R | null>): () => void
}

export interface CacheErrorFacade {
  (key: CacheKey): string | null
  <P extends unknown[]>(key: CacheShardKey<P> | CacheKey<P>, value: NewData<P, string | null>): () => void
}
