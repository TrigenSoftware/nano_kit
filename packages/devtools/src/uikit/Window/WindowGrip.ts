import {
  type Attributes,
  div,
  component$
} from 'nanoviews'
import { Icon } from '../Icon/index.js'
import styles from './WindowGrip.module.css'

export type WindowGripProps = Attributes<'div'>

/**
 * Resize handle in the corner of a `Window`: pointer handlers go here.
 */
export const WindowGrip = component$(({
  class: className,
  ...restProps
}: WindowGripProps) => (
  div({
    class: [className, styles.root],
    'aria-hidden': true,
    ...restProps
  })(
    Icon({
      name: 'grip',
      size: 12
    })
  )
))
