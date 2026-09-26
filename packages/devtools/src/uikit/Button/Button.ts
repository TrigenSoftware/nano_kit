import {
  type Signalish,
  pick
} from 'nanoviews/store'
import {
  type Attributes,
  button,
  component$
} from 'nanoviews'
import mixins from '../mixins.module.css'
import styles from './Button.module.css'

export interface ButtonProps extends Attributes<'button'> {
  variant?: Signalish<'primary' | 'secondary' | 'warning'>
}

export const Button = component$(({
  class: className,
  variant = 'primary',
  ...restProps
}: ButtonProps, children) => (
  button({
    class: [
      className,
      styles.root,
      pick(styles, variant),
      mixins.focusOutline
    ],
    type: 'button',
    ...restProps
  })(
    ...children
  )
))
