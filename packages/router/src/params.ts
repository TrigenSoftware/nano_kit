import {
  type Accessor,
  type KeysOf,
  type ValueOfKey,
  type ReadableSignal,
  computed
} from '@nano_kit/store'
import type { Routes } from './types.js'
import type {
  RouteLocationRecord,
  RouteMatch
} from './navigation.types.js'

export type SearchParamsSignal = ReadableSignal<URLSearchParams>

/**
 * Creates a computed signal that provides access to URL search parameters.
 * @param $location - Location signal record containing the current location state
 * @returns A computed signal that returns URLSearchParams instance
 */
/* @__NO_SIDE_EFFECTS__ */
export function searchParams($location: RouteLocationRecord<Routes>): SearchParamsSignal {
  const { $search } = $location

  return computed(() => new URLSearchParams($search()))
}

/**
 * Creates a computed signal for a specific search parameter with optional parsing.
 * @param $searchParams - Search parameters signal
 * @param key - The parameter key to extract
 * @param parser - Optional function to parse the parameter value
 * @returns A computed signal that returns the parsed parameter value
 */
/* @__NO_SIDE_EFFECTS__ */
export function searchParam<T = string | null>(
  $searchParams: SearchParamsSignal,
  key: string,
  parser: (value: string | null) => T = _ => _ as T
): ReadableSignal<T> {
  return computed(() => parser($searchParams().get(key)))
}

/**
 * Computed signal for a specific route parameter.
 * @param $location - Current location signal.
 * @param key - Parameter key to extract.
 * @param parser - Optional parser function for the parameter value.
 * @returns Computed signal of the parameter value.
 */
/* @__NO_SIDE_EFFECTS__ */
export function param<
  const R extends Routes,
  M extends RouteMatch<R> = RouteMatch<R>,
  K extends KeysOf<M['params']> = KeysOf<M['params']>,
  V extends ValueOfKey<M['params'], K> = ValueOfKey<M['params'], K>,
  T = V | undefined
>(
  $location: RouteLocationRecord<R>,
  key: K,
  parser: (value: NoInfer<V> | undefined) => T = _ => _ as unknown as T
): ReadableSignal<T> {
  const { $params } = $location as RouteLocationRecord<{}>

  return computed(() => parser(($params() as Record<K, V>)[key]))
}

/**
 * Computed signal for restrict a value to a specific route.
 * @param $location - Current location signal.
 * @param route - Route to restrict the value to.
 * @param $value - Signal containing the value to restrict.
 * @param fallback - Optional fallback value if the route does not match.
 * @returns Computed signal of the value if the route matches, otherwise fallback or previous value.
 */
/* @__NO_SIDE_EFFECTS__ */
export function forRoute<
  const R extends Routes,
  T,
  F = undefined
>(
  $location: RouteLocationRecord<R>,
  route: keyof R,
  $value: Accessor<T>,
  fallback?: F
): ReadableSignal<T | F> {
  const { $route } = $location as RouteLocationRecord<{}>

  return computed(prev => ($route() === route ? $value() : prev ?? fallback) as T | F)
}
