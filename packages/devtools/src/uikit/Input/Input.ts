import {
  type Attributes,
  input,
  component$
} from 'nanoviews'
import mixins from '../mixins.module.css'
import styles from './Input.module.css'

export type InputProps = Attributes<'input'>

export const Input = component$(({
  class: className,
  ...restProps
}: InputProps, _children: never) => (
  input({
    class: [
      className,
      styles.root,
      mixins.focusOutline
    ],
    type: 'text',
    ...restProps
  })
))
