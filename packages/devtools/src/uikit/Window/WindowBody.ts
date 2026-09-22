import {
  type Attributes,
  div,
  component$
} from 'nanoviews'
import styles from './WindowBody.module.css'

export type WindowBodyProps = Attributes<'div'>

export const WindowBody = component$(({
  class: className,
  ...restProps
}: WindowBodyProps, children) => (
  div({
    class: [className, styles.root],
    ...restProps
  })(
    ...children
  )
))
