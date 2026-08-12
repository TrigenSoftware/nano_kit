import {
  type WritableSignal,
  type ReadableSignal,
  type ComputedNode,
  type Accessor,
  type NewValue,
  NoneFlag,
  WritableMode,
  computedOper,
  createSignal,
  isWritable,
  nextValue,
  untracked
} from 'agera'
import type { AnyObject } from './types.js'
import { $get } from './utils.js'

// A child is one node and one bound function: the parent, the key and the
// writer live on the node the operators are bound to, so nothing here
// allocates a closure per child
interface ChildNode extends ComputedNode {
  /**
   * Parent signal.
   */
  p: WritableSignal<AnyObject>
  /**
   * Key to read from the parent, static or reactive.
   */
  k: PropertyKey | Accessor<PropertyKey>
  /**
   * Writes the key back into a copy of the parent value.
   */
  sv(parentValue: AnyObject, key: PropertyKey, value: unknown): AnyObject
}

function childCompute(this: ChildNode) {
  return this.p()?.[$get(this.k)]
}

function childOper(this: ChildNode, ...value: [NewValue<unknown>]) {
  if (value.length) {
    untracked(() => {
      const parent = this.p()
      const key = $get(this.k)

      this.p(this.sv(parent, key, nextValue(parent[key], value[0])))
    })
  } else {
    return computedOper.call(this)
  }
}

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
  const writable = isWritable($parent)

  // The mode is set in the literal rather than after the fact: the `onSignal`
  // hook fires from inside `createSignal`, and it is what attaches `set` in
  // the framework adapters
  return createSignal(writable ? childOper : computedOper, {
    value: undefined,
    subs: undefined,
    subsTail: undefined,
    deps: undefined,
    depsTail: undefined,
    flags: NoneFlag,
    modes: writable ? WritableMode : NoneFlag,
    compute: childCompute,
    p: $parent,
    k: key,
    sv: setValue
  } as unknown as ChildNode)
}
