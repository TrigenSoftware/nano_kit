import {
  type Attributes,
  h3,
  component$
} from 'nanoviews'
import styles from './BoxHeader.module.css'

export type BoxHeaderProps = Attributes<'h3'>

export const BoxHeader = component$(({
  class: className,
  ...restProps
}: BoxHeaderProps, children) => (
  h3({
    class: [className, styles.root],
    ...restProps
  })(
    ...children
  )
))
