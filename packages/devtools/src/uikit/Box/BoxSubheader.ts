import {
  type Attributes,
  h4,
  component$
} from 'nanoviews'
import styles from './BoxSubheader.module.css'

export type BoxSubheaderProps = Attributes<'h4'>

/**
 * A header inside a `BoxBody`, over the next part of what the box shows: it reads like `BoxHeader` and rules
 * the box off across its whole width, above and below.
 */
export const BoxSubheader = component$(({
  class: className,
  ...restProps
}: BoxSubheaderProps, children) => (
  h4({
    class: [className, styles.root],
    ...restProps
  })(
    ...children
  )
))
