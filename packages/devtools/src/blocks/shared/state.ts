import type { NodeState } from '../../services/registry/index.js'
import type { StatusTone } from '../../uikit/Status/index.js'

/**
 * How the blocks show the state of a node: the tone of its `Status`.
 */
export const STATE_TONES: Record<NodeState, StatusTone> = {
  unevaluated: 'muted',
  dirty: 'warning',
  mounted: 'success',
  unmounted: 'muted',
  active: 'success',
  detached: 'muted'
}
