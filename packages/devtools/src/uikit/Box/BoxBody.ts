import {
  type Attributes,
  div,
  component$
} from 'nanoviews'
import styles from './BoxBody.module.css'

export type BoxBodyProps = Attributes<'div'>

export const BoxBody = component$(({
  class: className,
  ...restProps
}: BoxBodyProps, children) => (
  div({
    class: [className, styles.root],
    ...restProps
  })(
    ...children
  )
))
