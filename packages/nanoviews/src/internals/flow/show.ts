import {
  type Accessor,
  effect,
  untracked,
  boundDeferScope,
  startScope,
  pauseScope,
  resumeScope
} from 'kida'
import type { Child } from '../types/index.js'
import { createTextNode } from '../elements/text.js'
import {
  insertChildBeforeAnchor,
  extractBetween
} from '../elements/child.js'

export function show(
  $value: Accessor<unknown>,
  render: () => Child
) {
  const start = createTextNode()
  const end = createTextNode()
  const fragment = document.createDocumentFragment()
  // The parked fragment doubles as the hidden flag, and `noDefer` effects
  // keep the parked DOM up to date
  let parked: DocumentFragment | undefined

  fragment.append(start, end)

  // The first pass hands the whole tree over in its initial state: the
  // content is built right here, under the caller's injection context, and
  // held back - the toggle below owns its starts, so a value flipped
  // before the first one never wakes the tree
  const scope = boundDeferScope()(() => {
    insertChildBeforeAnchor(render(), end)
  })

  pauseScope(scope)

  if (!untracked($value)) {
    parked = extractBetween(start, end)
  }

  effect(() => {
    if ($value()) {
      if (parked !== undefined) {
        end.before(parked)
        parked = undefined
      }

      // The first show claims the deferral token, every next one only
      // lifts the pause; whichever applies, the other is a no-op
      resumeScope(startScope(scope))
    } else if (parked === undefined) {
      // Cleanups run first, while their DOM is still attached
      pauseScope(scope)
      parked = extractBetween(start, end)
    }
  })

  // The echo: a value written back from inside the running toggle cannot
  // re-queue it. This second subscriber is idle at that moment, so its
  // read settles the value and re-queues the parked toggle for the
  // corrective pass
  effect(() => void $value(), true)

  return fragment
}
