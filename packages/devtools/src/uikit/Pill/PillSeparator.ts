import {
  type Attributes,
  span,
  component$
} from 'nanoviews'
import styles from './PillSeparator.module.css'

export type PillSeparatorProps = Attributes<'span'>

export const PillSeparator = component$(({
  class: className,
  ...restProps
}: PillSeparatorProps, _children: never) => (
  span({
    class: [className, styles.root],
    'aria-hidden': true,
    ...restProps
  })
))
