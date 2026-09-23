import {
  type ReactiveNode,
  NoneFlag,
  DirtyFlag,
  PendingFlag,
  MountableMode
} from '@nano_kit/store'
import { preview } from '../values/index.js'
import type {
  ChildNode,
  NodeKind,
  NodeRecord,
  NodeState
} from './registry.types.js'

/**
 * What a reactive node is, told by its shape.
 * @param node
 * @returns The kind.
 */
export function kindOf(node: ReactiveNode): NodeKind {
  if ('compute' in node) {
    return 'p' in node ? 'child' : 'computed'
  }

  if ('pendingValue' in node) {
    return 'signal'
  }

  if ('fn' in node) {
    return 'effect'
  }

  return 'value' in node ? 'selector' : 'scope'
}

/**
 * The signal a child signal was taken from and its key there.
 * @param node
 * @returns The node of the parent and the key; none for any other node.
 */
export function parentOf(node: ReactiveNode): [parent: ReactiveNode, key: unknown] | undefined {
  return 'p' in node
    ? [(node as ChildNode).p.node, (node as ChildNode).k]
    : undefined
}

function owns(kind: NodeKind) {
  return kind === 'effect' || kind === 'scope'
}

/**
 * A link whose dependency is an effect or a scope is not a read: it says where that one was created.
 * @param dep - Record of the dependency end of a link.
 * @returns Whether the link is ownership.
 */
export function isOwnership(dep: Pick<NodeRecord, 'kind'>) {
  return owns(dep.kind)
}

/**
 * Whether a node is an effect or a scope: the dependency end of an ownership link.
 * @param node
 * @returns Whether a link to the node is ownership.
 */
export function isOwner(node: ReactiveNode) {
  return owns(kindOf(node))
}

/**
 * The state of a node, read from its flags and the links of its record right now.
 * @param record
 * @returns The state.
 */
export function stateOf(record: Pick<NodeRecord, 'kind' | 'ref' | 'deps' | 'subs'>): NodeState {
  const node = record.ref.deref()

  if (node && !isOwnership(record) && record.kind !== 'selector') {
    if (record.kind !== 'signal' && node.flags === NoneFlag) {
      return 'unevaluated'
    }

    if (node.flags & (DirtyFlag | PendingFlag)) {
      return 'dirty'
    }

    if (node.modes & MountableMode) {
      return node.lcd ? 'mounted' : 'unmounted'
    }

    return record.subs.length ? 'active' : 'detached'
  }

  return node && record.deps.length ? 'active' : 'detached'
}

/**
 * The value of a node, read from the node right here and never evaluated.
 * @param record
 * @returns The value; none for an effect, a scope and a node that was collected.
 */
export function valueOf(record: NodeRecord): unknown {
  const node = record.ref.deref()

  return node && 'value' in node ? node.value : undefined
}

/**
 * The value of a record as one line, the way a table shows it: nothing for an effect or a scope,
 * which have no value, and for a computed nobody has evaluated, which is never evaluated for a look.
 * @param record
 * @returns The preview; empty when there is nothing to show.
 */
export function previewOf(record: NodeRecord) {
  return isOwnership(record) || record.state === 'unevaluated' ? '' : preview(valueOf(record))
}

/**
 * Visit what an update of a node left out of date: the nodes that read it, directly or through
 * one another, and still carry `DirtyFlag` or `PendingFlag`. Those are computeds read by hand with no
 * effect to pull them, paused effects, an effect that wrote to its own dependency. The flags are the
 * whole truth: a node evaluated a moment ago may have been invalidated again since.
 * @param node - The updated node.
 * @param seen - The nodes visited already, shared between the walks of one pass.
 * @param visit
 */
export function visitStale(node: ReactiveNode, seen: Set<ReactiveNode>, visit: (node: ReactiveNode) => void) {
  for (let link = node.subs; link; link = link.nextSub) {
    const { sub } = link

    if (!seen.has(sub) && sub.flags & (DirtyFlag | PendingFlag)) {
      seen.add(sub)
      visit(sub)
      visitStale(sub, seen, visit)
    }
  }
}
