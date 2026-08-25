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

  if (node) {
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

  if (node) {
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

  // One crossing into the DOM instead of one per node
  const range = document.createRange()

  range.setStartBefore(start)
  range.setEndAfter(end)
  range.deleteContents()
}

export function removeBetween(start: Node, end: Node): void {
  const parent = start.parentNode!

  // When the pair stands at the ends of its parent, everything between them
  // is everything the parent holds: one call sets the parent back to the two
  // markers, and the browser drops the rest without a range to walk
  if (start === parent.firstChild && end === parent.lastChild) {
    parent.replaceChildren(start as ChildNode, end as ChildNode)
  } else {
    remove(start.nextSibling!, end.previousSibling!)
  }
}
