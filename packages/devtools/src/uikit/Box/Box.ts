import {
  type Attributes,
  section,
  component$
} from 'nanoviews'
import styles from './Box.module.css'

export type BoxProps = Attributes<'section'>

/**
 * Framed summary box: a `BoxHeader` and a `BoxBody` inside.
 */
export const Box = component$(({
  class: className,
  ...restProps
}: BoxProps, children) => (
  section({
    class: [className, styles.root],
    ...restProps
  })(
    ...children
  )
))
