import {
  type Attributes,
  button,
  component$
} from 'nanoviews'
import mixins from '../mixins.module.css'
import styles from './ValueMore.module.css'

export type ValueMoreProps = Attributes<'button'>

/**
 * The last row of a long list of entries: loads the next page of them.
 */
export const ValueMore = component$(({
  class: className,
  ...restProps
}: ValueMoreProps, children) => (
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
