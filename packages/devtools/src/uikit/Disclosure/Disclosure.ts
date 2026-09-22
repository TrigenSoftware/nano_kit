import type {
  Signalish,
  WritableSignal
} from 'nanoviews/store'
import {
  type Attributes,
  button,
  component$
} from 'nanoviews'
import mixins from '../mixins.module.css'
import { Icon } from '../Icon/index.js'
import styles from './Disclosure.module.css'

export interface DisclosureProps extends Attributes<'button'> {
  $expanded: WritableSignal<boolean>
  /**
   * What the button expands: the accessible name is built from it.
   */
  label: Signalish<string>
}

/**
 * Chevron that expands and collapses a group. It swallows the click so the row around it does not react.
 */
export const Disclosure = component$(({
  class: className,
  $expanded,
  label,
  onClick,
  ...restProps
}: DisclosureProps, _children: never) => (
  button({
    class: [
      className,
      styles.root,
      mixins.focusOutline
    ],
    type: 'button',
    'aria-expanded': $expanded,
    'aria-label': label,
    onClick(event) {
      event.stopPropagation()
      $expanded(expanded => !expanded)
      onClick?.(event)
    },
    ...restProps
  })(
    Icon({
      class: styles.icon,
      name: 'chevron-right',
      size: 14
    })
  )
))
