import {
  type Signalish,
  when
} from 'nanoviews/store'
import {
  type Attributes,
  button,
  component$
} from 'nanoviews'
import mixins from '../mixins.module.css'
import styles from './Pill.module.css'

export interface PillProps extends Attributes<'button'> {
  /**
   * Accessible name: what the pill opens.
   */
  label: Signalish<string>
  /**
   * Lifted look while the pill is being dragged.
   */
  dragging?: Signalish<boolean>
}

/**
 * The collapsed devtools: a capsule that opens the window. Where it sits and how it moves is the caller's.
 */
export const Pill = component$(({
  class: className,
  label,
  dragging,
  ...restProps
}: PillProps, children) => (
  button({
    class: [
      className,
      styles.root,
      when(dragging, styles.dragging),
      mixins.focusOutline
    ],
    type: 'button',
    'aria-label': label,
    ...restProps
  })(
    ...children
  )
))
