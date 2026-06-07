import {
  type WritableSignal,
  type ReadableSignal,
  type Accessor,
  type NewValue,
  computed,
  morph,
  isWritable,
  unsafeMarkWritable,
  isFunction,
  untracked
} from 'agera'
import type { AnyObject } from './types.js'
import { $get } from './utils.js'

/**
 * Create a writable child signal from a parent signal.
 * @param $parent - Parent signal.
 * @param key - Static or signal key to get from the parent.
 * @param setValue - Function to set the value in the parent.
 * @returns A writable child signal.
 */
export function child<
  P extends AnyObject,
  K extends keyof P,
  V extends P[K]
>(
  $parent: WritableSignal<P>,
  key: K | Accessor<K>,
  setValue: (parentValue: P, key: K, value: V) => P
): WritableSignal<V>

/**
 * Create a readable child signal from a parent signal.
 * @param $parent - Parent signal.
 * @param key - Static or signal key to get from the parent.
 * @param setValue - Function to set the value in the parent.
 * @returns A readable child signal.
 */
export function child<
  P extends AnyObject,
  K extends keyof P,
  V extends P[K]
>(
  $parent: Accessor<P>,
  key: K | Accessor<K>,
  setValue?: (parentValue: P, key: K, value: V) => P
): ReadableSignal<V>

/* @__NO_SIDE_EFFECTS__ */
export function child<
  P extends AnyObject,
  K extends keyof P,
  V extends P[K]
>(
  $parent: WritableSignal<P> | Accessor<P>,
  key: K | Accessor<K>,
  setValue?: (parentValue: P, key: K, value: V) => P
) {
  const getter = computed(() => {
    const parent = $parent()

    return parent?.[$get(key)]
  })

  if (!isWritable($parent)) {
    return getter
  }

  const setter = (value: NewValue<V>) => untracked(() => {
    const parent = $parent()
    const k = $get(key)

    $parent(setValue!(
      parent,
      k,
      isFunction(value) ? value(parent[k]) : value
    ))
  })

  unsafeMarkWritable(getter)

  return morph(getter, {
    get: getter,
    set: setter
  })
}
