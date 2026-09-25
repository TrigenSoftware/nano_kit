import type { NodeKind } from '../../services/registry/index.js'
import type { IconName } from '../../uikit/Icon/index.js'

/**
 * How the blocks show the kind of a node: its icon.
 */
export const KIND_ICONS: Record<NodeKind, IconName> = {
  signal: 'signal',
  map: 'map',
  computed: 'computed',
  child: 'child',
  selector: 'selector',
  effect: 'effect',
  scope: 'effect'
}
