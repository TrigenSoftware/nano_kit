import type { DeferredScope } from 'kida'

export type EffectScopeSwapperCallback<T> = (
  destroyPrev: DeferredScope | undefined,
  value: T
) => DeferredScope
