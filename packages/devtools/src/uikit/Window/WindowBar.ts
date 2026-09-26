import {
  type Attributes,
  div,
  header,
  component$,
  slot$,
  slots$
} from 'nanoviews'
import styles from './WindowBar.module.css'

export type WindowBarProps = Attributes<'header'>

export const WindowBarStart = slot$<Attributes<'div'>>(({
  class: className,
  ...restProps
}, children) => (
  div({
    class: [className, styles.start],
    ...restProps
  })(
    ...children
  )
))

export const WindowBarCenter = slot$<Attributes<'div'>>(({
  class: className,
  ...restProps
}, children) => (
  div({
    class: [className, styles.center],
    ...restProps
  })(
    ...children
  )
))

export const WindowBarEnd = slot$<Attributes<'div'>>(({
  class: className,
  ...restProps
}, children) => (
  div({
    class: [className, styles.end],
    ...restProps
  })(
    ...children
  )
))

/**
 * Title bar of a `Window` in three zones: `WindowBarStart`, `WindowBarCenter` and `WindowBarEnd`.
 * It is the drag handle, so pointer handlers go here.
 */
export const WindowBar = component$(slots$([
  WindowBarStart,
  WindowBarCenter,
  WindowBarEnd
], ({
  class: className,
  ...restProps
}: WindowBarProps, start, center, end) => (
  header({
    class: [className, styles.root],
    ...restProps
  })(
    start,
    center,
    end
  )
)))
