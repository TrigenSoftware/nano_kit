import type { Signalish } from 'nanoviews/store'
import {
  type Attributes,
  section,
  component$
} from 'nanoviews'
import styles from './Window.module.css'

export interface WindowProps extends Attributes<'section'> {
  /**
   * Accessible name of the dialog.
   */
  label: Signalish<string>
}

/**
 * Floating window chrome: fills the box it is given. Put a `WindowBar` and a `WindowBody` inside, and the `WindowEdge`
 * handles after it in the same box; where the box sits and how it moves is the caller's.
 */
export const Window = component$(({
  class: className,
  label,
  ...restProps
}: WindowProps, children) => (
  section({
    class: [className, styles.root],
    role: 'dialog',
    'aria-label': label,
    ...restProps
  })(
    ...children
  )
))
