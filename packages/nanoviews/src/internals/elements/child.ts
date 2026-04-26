import {
  isAccessor,
  isFunction
} from 'kida'
import type {
  Child,
  EmptyValue,
  LazyChild,
  MaybeDestroy
} from '../types/index.js'
import { isEmpty } from '../utils.js'
import {
  createTextNode,
  createTextNodeFromAccessor
} from './text.js'

export function isLazyChild<T extends () => Child = () => Child>(
  child: unknown
): child is LazyChild<T> {
  return isFunction(child) && 'c' in child
}

export function lazyChild<T extends () => Child>(
  child: T
): LazyChild<T> {
  (child as LazyChild<T>).c = true

  return child as LazyChild<T>
}

export function childToNode(child: Child) {
  if (isEmpty(child)) {
    return child
  }

  if (isLazyChild(child)) {
    return childToNode(child())
  }

  return isAccessor(child)
    ? createTextNodeFromAccessor(child)
    : typeof child === 'object'
      ? child
      : createTextNode(child)
}

export function mountChild(
  target: ParentNode,
  child: Child
): MaybeDestroy {
  const node = childToNode(child)

  if (!isEmpty(node)) {
    if (node.nodeType === 11) {
      const start = node.firstChild
      const end = node.lastChild

      target.appendChild(node)

      return () => remove(start!, end!)
    }

    target.appendChild(node)

    return () => (node as ChildNode).remove()
  }
}

export function insertChildBeforeAnchor(
  child: Child,
  anchor: ChildNode,
  rangeContainer?: {
    f: ChildNode | EmptyValue
    l: ChildNode | EmptyValue
  }
) {
  const node = childToNode(child)

  if (!isEmpty(node)) {
    if (rangeContainer !== undefined) {
      if (node.nodeType === 11) {
        rangeContainer.f = node.firstChild!
        rangeContainer.l = node.lastChild!
      } else {
        rangeContainer.f = rangeContainer.l = node as ChildNode
      }
    }

    anchor.before(node)
  }
}

export function remove(start: ChildNode, end: Node): void {
  if (start === end) {
    start.remove()
    return
  }

  const endNextSibling = end.nextSibling

  while (start !== endNextSibling) {
    const next = start.nextSibling!

    start.remove()
    start = next
  }
}

export function removeBetween(start: Node, end: Node): void {
  remove(start.nextSibling!, end.previousSibling!)
}
