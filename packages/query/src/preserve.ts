import {
  type Accessor,
  type ReadableSignal,
  computed
} from '@nano_kit/store'
import type { CacheKey } from './CacheStorage.types.js'

/**
 * Preserve the data of a previous key on screen while the current key has no data,
 * so search results do not blink out while a new search loads.
 * Data is preserved only across a change of the key and only when there was data to preserve:
 * when the shown key loses its data, as on `invalidate`, nothing is preserved.
 * @param $data - The data signal of a query.
 * @param $key - The key signal of the same query.
 * @param keep - Optional predicate that tells whether the preserved data may stay.
 * It gets the current parameters, missing while the query is skipped, and the parameters of the preserved data.
 * @returns A tuple with the shown data, the key of the shown data and whether the data is preserved.
 */
/* @__NO_SIDE_EFFECTS__ */
export function preserve<T, P extends unknown[], R>(
  $data: Accessor<T | null>,
  $key: Accessor<CacheKey<P, R>>,
  keep?: (params: Partial<P>, preservedParams: P) => boolean
): readonly [
  $preservedData: ReadableSignal<T | null>,
  $preservedKey: ReadableSignal<CacheKey<P, R>>,
  $preserved: ReadableSignal<boolean>
] {
  const $shown = computed((shown?: readonly [CacheKey<P, R>, T | null]) => {
    const data = $data()
    const key = $key()

    // The key signal keeps its object while the key is the same,
    // so data that the shown key loses, as on `invalidate`, is not preserved
    return data === null
      && shown
      && shown[1] !== null
      && shown[0] !== key
      && (!keep || keep(key.params, shown[0].params))
      ? shown
      : [key, data] as const
  })

  return [
    computed(() => $shown()[1]),
    computed(() => $shown()[0]),
    computed(() => $shown()[0] !== $key())
  ]
}
