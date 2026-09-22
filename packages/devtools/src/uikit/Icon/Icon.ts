import {
  type Signalish,
  f as text
} from 'nanoviews/store'
import { component$ } from 'nanoviews'
import {
  type Attributes,
  svg,
  use
} from 'nanoviews/svg'
import spriteUrl from '../../assets/sprite.svg?no-inline'
import type { IconName } from './icons.js'
import styles from './Icon.module.css'

export interface IconProps extends Attributes<'svg'> {
  name: Signalish<IconName>
  /**
   * Width and height in pixels.
   */
  size?: Signalish<number>
}

const DEFAULT_SIZE = 16

/**
 * Sprite icon. Decorative by default: the element that uses it carries the label.
 */
export const Icon = component$(({
  class: className,
  name,
  size = DEFAULT_SIZE,
  ...restProps
}: IconProps, _children: never) => (
  svg({
    class: [styles.root, className],
    'aria-hidden': true,
    width: size,
    height: size,
    ...restProps
  })(
    use({
      href: text`${spriteUrl}#${name}`
    })
  )
))
