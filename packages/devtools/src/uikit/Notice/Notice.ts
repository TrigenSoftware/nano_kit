import {
  type Signalish,
  pick
} from 'nanoviews/store'
import {
  type Attributes,
  div,
  span,
  component$,
  slot$,
  slots$
} from 'nanoviews'
import styles from './Notice.module.css'

export type NoticeTone = 'warning' | 'danger' | 'info'

export interface NoticeProps extends Attributes<'div'> {
  tone: Signalish<NoticeTone>
}

export type NoticeActionsProps = Attributes<'div'>

/**
 * Actions of a `Notice`, laid out after its text.
 */
export const NoticeActions = slot$(({
  class: className,
  ...restProps
}: NoticeActionsProps, children) => (
  div({
    class: [className, styles.actions],
    ...restProps
  })(
    ...children
  )
))

/**
 * A tinted line with a dot, a message and optional `NoticeActions`.
 */
export const Notice = component$(slots$([NoticeActions], ({
  class: className,
  tone,
  ...restProps
}: NoticeProps, actions, children) => (
  div({
    class: [
      className,
      styles.root,
      pick(styles, tone),
      actions && styles.withActions
    ],
    role: 'status',
    ...restProps
  })(
    span({
      class: styles.text
    })(
      ...children
    ),
    actions
  )
)))
