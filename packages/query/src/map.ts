import {
  type SignalsMap,
  type SignalsMapEvents,
  type NewValue,
  batch,
  $getMapKey,
  setMapKey,
  clearMap,
  deleteMapKey,
  $$insert,
  fireMapEvent,
  subMapEvent
} from '@nano_kit/store'

export interface ShardKey<S> {
  shard: S
  key?: undefined
}

export interface ShardedKey<S, K> {
  shard: S
  key: K
}

export interface ShardedSignalsMap<S, K, T> extends SignalsMapEvents, Map<
  S,
  SignalsMap<K, T>
> {}

/**
 * Check if sharded map has the key.
 * Checks full key.
 * @param map - The sharded map.
 * @param shardedKey - The sharded key.
 * @returns True if the sharded map has the key, false otherwise.
 */
/* @__NO_SIDE_EFFECTS__ */
export function hasShardedMapKey<S, K, T>(
  map: ShardedSignalsMap<S, K, T>,
  shardedKey: ShardKey<S> | ShardedKey<S, K>
) {
  const {
    shard,
    key
  } = shardedKey

  if (key === undefined) {
    return map.has(shard)
  }

  return map.get(shard)?.has(key) || false
}

/**
 * Get value from sharded map by key.
 * @param map - The sharded map.
 * @param shardedKey - The sharded key.
 * @returns The value or undefined if not found.
 */
export function $getShardedMapKey<S, K, T>(
  map: ShardedSignalsMap<S, K, T>,
  shardedKey: ShardedKey<S, K>
) {
  const {
    shard,
    key
  } = shardedKey
  let shardMap

  if ((shardMap = map.get(shard)) === undefined) {
    subMapEvent(map, $$insert)
    return undefined
  }

  return $getMapKey(shardMap, key)
}

/**
 * Set value in sharded map by key.
 * If sharded key contains only shard name, sets value for all entries in the shard.
 * @param map - The sharded map.
 * @param shardedKey - The sharded key.
 * @param value - The value to set.
 */
export function setShardedMapKey<S, K, T>(
  map: ShardedSignalsMap<S, K, T>,
  shardedKey: ShardKey<S> | ShardedKey<S, K>,
  value: NewValue<T | undefined>
) {
  const {
    shard,
    key
  } = shardedKey
  let shardMap = map.get(shard)
  const shardExists = shardMap !== undefined

  if (key === undefined) {
    if (shardExists) {
      batch(() => {
        for (const params of shardMap!.keys()) {
          setMapKey(shardMap!, params, value)
        }
      })
    }

    return
  }

  if (!shardExists) {
    map.set(
      shard,
      shardMap = new Map<K, T>() as SignalsMap<K, T>
    )
  }

  setMapKey(shardMap!, key, value)

  if (!shardExists) {
    fireMapEvent(map, $$insert)
  }
}

/**
 * Delete sharded map key.
 * If sharded key contains only shard name, deletes all entries in the shard.
 * @param map - The sharded map.
 * @param shardedKey - The sharded key.
 */
export function deleteShardedMapKey<S, K, T>(
  map: ShardedSignalsMap<S, K, T>,
  shardedKey: ShardKey<S> | ShardedKey<S, K>
) {
  const {
    shard,
    key
  } = shardedKey
  const shardMap = map.get(shard)

  if (shardMap === undefined) {
    return
  }

  if (key === undefined) {
    clearMap(shardMap)
    return
  }

  deleteMapKey(shardMap, key)
}
