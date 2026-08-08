import {
  type Accessor,
  type ValueOrAccessor,
  type DeferredScope,
  isAccessor
} from 'kida'
import type { Child } from '../types/index.js'
import {
  deferScopeBindContext,
  effectScopeSwapper
} from '../effects.js'
import { createTextNode } from '../elements/text.js'
import {
  insertChildBeforeAnchor,
  removeBetween
} from '../elements/child.js'

export function reactiveDecide<T>(
  $condition: Accessor<T>,
  decider: (value: T) => Child
) {
  const start = createTextNode()
  const end = createTextNode()
  const deferScope = deferScopeBindContext()
  const fragment = document.createDocumentFragment()

  fragment.append(start, end)

  // The replaced scope is destroyed first, while its DOM is still
  // attached; then the body removes it and renders the new content
  effectScopeSwapper($condition, (
    destroyPrev: DeferredScope | undefined,
    condition: T
  ) => deferScope(() => {
    if (destroyPrev !== undefined) {
      removeBetween(start, end)
    }

    insertChildBeforeAnchor(decider(condition), end)
  }, destroyPrev))

  return fragment
}

/**
 * Dinamicly decide which child to render based on condition
 * @param $condition - Static value or store
 * @param decider - Function that returns child based on condition
 * @returns Block that renders decided child
 */
export function decide<T>(
  $condition: ValueOrAccessor<T>,
  decider: (value: T) => Child
) {
  if (isAccessor($condition)) {
    return reactiveDecide($condition, decider)
  }

  return decider($condition)
}
