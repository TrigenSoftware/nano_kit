import type {
  AnySignal,
  ReactiveNode,
  ReadableNode
} from '@nano_kit/store'
import type { NodeName } from '../naming/index.js'

export type NodeKind = 'signal' | 'map' | 'computed' | 'child' | 'selector' | 'effect' | 'scope'

/**
 * A child signal of kida: a computed over its parent that remembers the parent and its key in it.
 */
export interface ChildNode extends ReactiveNode {
  p: {
    node: ReactiveNode
  }
  k: unknown
}

/**
 * A node of a signals map in development, which carries the map: its version, which stands for the map, an entry,
 * which carries its key too, and the index of an indexed map.
 */
export interface MapNode extends ReactiveNode {
  /**
   * The map. An indexed one has its index, which wears the node of the anchor every read of the map links to.
   */
  map: Map<unknown, AnySignal> & {
    $v: AnySignal
    $index?: AnySignal
  }
  /**
   * Of an entry, its key.
   */
  key?: unknown
}

/**
 * What a row says about its node. `unevaluated` and `dirty` come first: a computed that was never
 * read, a computed an update left out of date. A mountable node is `mounted` or `unmounted`; anything
 * else is `active` while something keeps it busy, subscribers for a value, dependencies for an
 * effect, and `detached` otherwise.
 */
export type NodeState = 'unevaluated' | 'dirty' | 'mounted' | 'unmounted' | 'active' | 'detached'

/**
 * What the panel knows about a reactive node. Plain data that is never changed in place: whatever
 * happens to the node gives it a new record. The node and its signal are held weakly,
 * a record never keeps application state alive.
 */
export interface NodeRecord {
  readonly id: number
  readonly kind: NodeKind
  readonly name: NodeName
  /**
   * The node itself: where the value is read from, and the flags. The only way to an effect,
   * a scope, a selector and a node older than its record, which come with no signal.
   */
  readonly ref: WeakRef<ReadableNode>
  /**
   * The signal, the way the application reads it: known for a signal or a computed whose
   * creation was seen. Reading it is how the panel evaluates a computed on the word of the user,
   * with nothing but the public call.
   */
  readonly signal: WeakRef<AnySignal> | undefined
  /**
   * For a child signal, id of the signal it was taken from.
   */
  readonly parent: number | undefined
  /**
   * Ids of the nodes this one reads.
   */
  readonly deps: number[]
  /**
   * Ids of the nodes that read this one.
   */
  readonly subs: number[]
  /**
   * Ids of the effects and scopes created inside this one.
   */
  readonly owned: number[]
  /**
   * Id of the effect or scope this one was created inside.
   */
  readonly owner: number | undefined
  /**
   * The node is older than its record: it was reached through a link or an event, its creation
   * was not seen, so it is named after no place.
   */
  readonly reached: boolean
  /**
   * The state as of the last event about the node.
   */
  readonly state: NodeState
  /**
   * How many times the value changed under the eyes of the panel. The value itself stays in the node.
   */
  readonly updates: number
}
