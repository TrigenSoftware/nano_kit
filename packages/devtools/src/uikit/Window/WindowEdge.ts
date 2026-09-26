import {
  type Attributes,
  div,
  component$
} from 'nanoviews'
import styles from './WindowEdge.module.css'

/**
 * An edge or a lower corner of a `Window`. The top edge belongs to the bar, which moves the window.
 */
export type WindowEdgeName = 'left' | 'right' | 'bottom' | 'bottomLeft' | 'bottomRight'

export interface WindowEdgeProps extends Attributes<'div'> {
  edge: WindowEdgeName
}

/**
 * Invisible resize handle on an edge or a lower corner of a `Window`, half out of it: put it after the window
 * in the box the window fills. Pointer handlers go here.
 */
export const WindowEdge = component$(({
  class: className,
  edge,
  ...restProps
}: WindowEdgeProps) => (
  div({
    class: [className, styles.root, styles[edge]],
    'aria-hidden': true,
    ...restProps
  })
))
