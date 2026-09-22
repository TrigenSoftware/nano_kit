import {
  type Signalish,
  when
} from 'nanoviews/store'
import {
  type Attributes,
  div,
  component$
} from 'nanoviews'
import styles from './Theme.module.css'

export interface ThemeProps extends Attributes<'div'> {
  light?: Signalish<boolean>
}

/**
 * Design tokens for everything inside: the dark palette by default, the light one on request.
 */
export const Theme = component$(({
  class: className,
  light,
  ...restProps
}: ThemeProps, children) => (
  div({
    class: [
      className,
      styles.root,
      when(light, styles.light)
    ],
    ...restProps
  })(
    ...children
  )
))
