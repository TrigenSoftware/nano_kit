import {
  type Accessor,
  type DeferredScope,
  effect
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

export function swap<T>(
  $value: Accessor<T>,
  render: (value: T) => Child
) {
  const start = createTextNode()
  const end = createTextNode()
  const deferScope = deferScopeBindContext()
  const fragment = document.createDocumentFragment()

  fragment.append(start, end)

  // The replaced scope is destroyed first, while its DOM is still
  // attached; then the body removes it and renders the new content
  effectScopeSwapper($value, (
    destroyPrev: DeferredScope | undefined,
    value: T
  ) => deferScope(() => {
    if (destroyPrev !== undefined) {
      removeBetween(start, end)
    }

    insertChildBeforeAnchor(render(value), end)
  }, destroyPrev))

  // The echo: content that writes the value back does it from inside the
  // running swapper, which cannot be re-queued by its own propagation. This
  // second subscriber is idle at that moment, so its read settles the value
  // and re-queues the parked swapper for the corrective swap
  effect(() => void $value(), true)

  return fragment
}
