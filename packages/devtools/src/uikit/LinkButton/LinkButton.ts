import {
  type Attributes,
  button,
  component$
} from 'nanoviews'
import mixins from '../mixins.module.css'
import styles from './LinkButton.module.css'

export type LinkButtonProps = Attributes<'button'>

/**
 * An inline action that reads as a link: a reference to another row of the panel.
 */
export const LinkButton = component$(({
  class: className,
  ...restProps
}: LinkButtonProps, children) => (
  button({
    class: [
      className,
      styles.root,
      mixins.focusOutline
    ],
    type: 'button',
    ...restProps
  })(
    ...children
  )
))
