import {
  type NewValue,
  SignalsMap,
  batch
} from '@nano_kit/store'

export interface ShardKey<S> {
  shard: S
  key?: undefined
}

export interface ShardedKey<S, K> {
  shard: S
  key: K
}

// What the class keeps of Map: the shards, which are signals maps and hand no
// signal out. `has`, `set` and `delete` are taken over by their sharded
// versions, the raw `has` and `set` are reached through `super`. Declared
// only: the cast in the heritage clause is all that is left of it at runtime
declare class ShardsMap<S, K, T> {
  readonly size: number
  protected has(shard: unknown): boolean
  protected set(shard: unknown, map: unknown): unknown
  get(shard: S): SignalsMap<K, T> | undefined
  forEach(callback: (map: SignalsMap<K, T>, shard: S) => void): void
}

/**
 * Signals maps by shard: a value is addressed by a shard and a key in it,
 * and a key of a shard alone addresses every value of the shard.
 */
export class ShardedSignalsMap<S, K, T> extends (Map as unknown as typeof ShardsMap)<S, K, T> {
  // A shard is made by whoever asks for it first, a reader included: a reader
  // of a key that is not there waits for it on the shard, so there is nothing
  // to wait for on the map itself
  #shard(shard: S) {
    let map = this.get(shard)

    if (!map) {
      super.set(shard, map = new SignalsMap())
    }

    return map
  }

  /**
   * Check if the map has the key.
   * A key of a shard alone tells whether the shard is there.
   * @param shardedKey - The sharded key.
   * @returns Whether the key is there.
   */
  override has({
    shard,
    key
  }: ShardKey<S> | ShardedKey<S, K>) {
    return key === undefined
      ? super.has(shard)
      : this.get(shard)?.has(key) || false
  }

  /**
   * Get the value by key: the running computed or effect runs again when
   * the value changes, and when the key appears or goes.
   * @param shardedKey - The sharded key.
   * @returns The value.
   */
  $get({
    shard,
    key
  }: ShardedKey<S, K>) {
    return this.#shard(shard).$get(key)
  }

  /**
   * Set the value by key.
   * A key of a shard alone sets the value of every key of the shard.
   * @param shardedKey - The sharded key.
   * @param value - The value or a reducer of the current one.
   */
  override set(
    {
      shard,
      key
    }: ShardKey<S> | ShardedKey<S, K>,
    value: NewValue<T | undefined>
  ) {
    if (key !== undefined) {
      this.#shard(shard).set(key, value)
    } else {
      const map = this.get(shard)

      if (map) {
        batch(() => {
          for (const each of map.keys()) {
            map.set(each, value)
          }
        })
      }
    }
  }

  /**
   * Delete the value by key.
   * A key of a shard alone deletes every value of the shard.
   * @param shardedKey - The sharded key.
   */
  delete({
    shard,
    key
  }: ShardKey<S> | ShardedKey<S, K>) {
    const map = this.get(shard)

    if (map) {
      if (key === undefined) {
        map.clear()
      } else {
        map.delete(key)
      }
    }
  }
}
