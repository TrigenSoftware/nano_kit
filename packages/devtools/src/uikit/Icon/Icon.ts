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
 * It refers to a symbol of `assets/sprite.svg` in its own tree: the panel holds the sprite in its shadow root,
 * the preview of Storybook in the page.
 */
export const Icon = component$(({
  class: className,
  name,
  size = DEFAULT_SIZE,
  ...restProps
}: IconProps) => (
  svg({
    class: [styles.root, className],
    'aria-hidden': true,
    width: size,
    height: size,
    ...restProps
  })(
    use({
      href: text`#${name}`
    })
  )
))
