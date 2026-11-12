import {
  type Accessor,
  type ReadableSignal,
  computed
} from '@nano_kit/store'
import type { CacheKey } from './CacheStorage.types.js'

/**
 * Hold the data of a previous key on screen while the current key has no data,
 * so search results do not blink out while a new search loads.
 * Data is held only across a change of the key and only when there was data to hold:
 * when the shown key loses its data, as on `invalidate`, nothing is held.
 * @param $data - The data signal of a query.
 * @param $key - The key signal of the same query.
 * @param keep - Optional predicate that tells whether the held data may stay.
 * It gets the current parameters, missing while the query is skipped, and the parameters of the held data.
 * @returns A tuple with the shown data, the key of the shown data and whether the data is held.
 */
/* @__NO_SIDE_EFFECTS__ */
export function hold<T, P extends unknown[], R>(
  $data: Accessor<T | null>,
  $key: Accessor<CacheKey<P, R>>,
  keep?: (params: Partial<P>, heldParams: P) => boolean
): readonly [
  $heldData: ReadableSignal<T | null>,
  $heldKey: ReadableSignal<CacheKey<P, R>>,
  $held: ReadableSignal<boolean>
] {
  const $shown = computed((shown?: readonly [CacheKey<P, R>, T | null]) => {
    const data = $data()
    const key = $key()

    // The key signal keeps its object while the key is the same,
    // so data that the shown key loses, as on `invalidate`, is not held
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
