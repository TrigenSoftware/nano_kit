import type {
  Signalish,
  WritableSignal
} from 'nanoviews/store'
import {
  type Attributes,
  type KeyboardEvent,
  div,
  span,
  component$,
  slot$,
  slots$,
  if_
} from 'nanoviews'
import { Icon } from '../Icon/index.js'
import styles from './ValueNode.module.css'

export interface ValueNodeProps extends Attributes<'div'> {
  /**
   * Key of the value in its parent; the root of a tree has none.
   */
  name?: Signalish<string>
  /**
   * Expanded state of a value with entries: the row toggles it. Leave unset for a leaf.
   */
  $expanded?: WritableSignal<boolean>
}

/**
 * Entries of a `ValueNode`: built when the node expands, so a deep value costs nothing while it is closed.
 */
export const ValueChildren = slot$<Attributes<'div'>>(({
  class: className,
  ...restProps
}, children) => (
  div({
    class: [className, styles.group],
    role: 'group',
    ...restProps
  })(
    ...children
  )
))

/**
 * One value of a `ValueTree`: its name, then the preview given as children, then its `ValueChildren`.
 */
export const ValueNode = component$(slots$([ValueChildren], ({
  class: className,
  name,
  $expanded,
  onKeyDown,
  ...restProps
}: ValueNodeProps, entries, children) => (
  div({
    class: [
      className,
      styles.root,
      $expanded && styles.expandable
    ],
    role: 'treeitem',
    'aria-expanded': $expanded,
    tabIndex: $expanded && 0,
    onKeyDown: $expanded
      ? (event: KeyboardEvent<HTMLDivElement>) => {
        // A key pressed in a nested node bubbles through every node above it
        if (event.target === event.currentTarget) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            $expanded(expanded => !expanded)
          } else if (event.key === 'ArrowRight') {
            $expanded(true)
          } else if (event.key === 'ArrowLeft') {
            $expanded(false)
          }
        }

        onKeyDown?.(event)
      }
      : onKeyDown,
    ...restProps
  })(
    div({
      class: styles.row,
      onClick: $expanded && (() => {
        $expanded(expanded => !expanded)
      })
    })(
      $expanded
        ? Icon({
          class: styles.chevron,
          name: 'chevron-right',
          size: 14
        })
        // A leaf keeps the width of the chevron, so the names of one level line up;
        // the root has no name and nothing to line up with
        : name === undefined
          ? null
          : span({
            class: styles.spacer
          }),
      name === undefined
        ? null
        : span({
          class: styles.name
        })(
          name
        ),
      span({
        class: styles.preview
      })(
        ...children
      )
    ),
    $expanded && if_($expanded)(() => entries)
  )
)))
