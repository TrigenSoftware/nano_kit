import {
  type Signalish,
  pick
} from 'nanoviews/store'
import {
  type Attributes,
  span,
  component$
} from 'nanoviews'
import styles from './Tag.module.css'

export type TagTone = 'info' | 'success' | 'warning' | 'danger' | 'muted'

export interface TagProps extends Attributes<'span'> {
  tone: Signalish<TagTone>
}

export const Tag = component$(({
  class: className,
  tone,
  ...restProps
}: TagProps, children) => (
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
