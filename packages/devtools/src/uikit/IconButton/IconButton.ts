import type { Signalish } from 'nanoviews/store'
import {
  type Attributes,
  button,
  component$
} from 'nanoviews'
import mixins from '../mixins.module.css'
import styles from './IconButton.module.css'

export interface IconButtonProps extends Attributes<'button'> {
  /**
   * Accessible name, also the tooltip: the icon inside is decorative.
   */
  label: Signalish<string>
  /**
   * Toggle state for a button that stays pressed, like pause.
   */
  pressed?: Signalish<boolean>
}

export const IconButton = component$(({
  class: className,
  label,
  pressed,
  ...restProps
}: IconButtonProps, children) => (
  button({
    class: [
      className,
      styles.root,
      mixins.focusOutline
    ],
    type: 'button',
    'aria-label': label,
    'aria-pressed': pressed,
    title: label,
    ...restProps
  })(
    ...children
  )
))
