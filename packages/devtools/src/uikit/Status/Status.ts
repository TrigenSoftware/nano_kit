import {
  type Signalish,
  pick
} from 'nanoviews/store'
import {
  type Attributes,
  span,
  component$
} from 'nanoviews'
import styles from './Status.module.css'

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'muted'

export interface StatusProps extends Attributes<'span'> {
  tone: Signalish<StatusTone>
}

/**
 * A colored dot followed by the state it stands for.
 */
export const Status = component$(({
  class: className,
  tone,
  ...restProps
}: StatusProps, children) => (
  span({
    class: [
      className,
      styles.root,
      pick(styles, tone)
    ],
    ...restProps
  })(
    ...children
  )
))
