import {
  type Accessor,
  signal
} from 'nanoviews/store'
import {
  type Child,
  div,
  component$,
  for_,
  if_
} from 'nanoviews'
import {
  preview,
  sizeOf,
  entriesOf
} from '../../services/values/index.js'
import {
  ValueNode,
  ValueChildren,
  ValueMore
} from '../../uikit/ValueTree/index.js'
import styles from './Inspector.module.css'

// Entries come a page at a time
const PAGE = 50
// A string longer than its preview opens into the whole of it
const LINE = 80

export interface ValueBranchProps {
  /**
   * Key of the value in its parent; the root has none.
   */
  $name?: Accessor<string>
  /**
   * The live value: read again whenever the node of the inspected record changes.
   */
  $value: Accessor<unknown>
  /**
   * Start opened: the root of a tree.
   */
  defaultExpanded?: boolean
}

function isLong(value: unknown): value is string {
  return typeof value === 'string' && value.length > LINE
}

function isBranch(value: unknown) {
  return sizeOf(value) > 0 || isLong(value)
}

/**
 * One value of the tree and, once opened, its entries. A value may turn from a leaf into
 * a collection and back as the application goes on: the node is rebuilt only when that flips,
 * and follows its value through bindings the rest of the time, so an opened branch stays open.
 * The type is spelled out because the component renders itself for its entries.
 */
export const ValueBranch = component$(({
  $name,
  $value,
  defaultExpanded = false
}: ValueBranchProps): Child => {
  const $expanded = signal(defaultExpanded)
  const $limit = signal(PAGE)
  const $preview = () => preview($value())
  const $isBranch = () => isBranch($value())
  const $isLong = () => isLong($value())
  // Read from the live value when the node opens, a page at a time: nothing is serialized in depth
  const $entries = () => {
    const value = $value()

    return typeof value === 'object' && value ? entriesOf(value, 0, $limit()) : []
  }
  const $rest = () => sizeOf($value()) - $limit()
  const $hasMore = () => $rest() > 0

  return if_($isBranch)(() => (
    ValueNode({
      name: $name,
      $expanded
    })(
      $preview,
      ValueChildren()(
        if_($isLong)(() => (
          div({
            class: styles.text
          })(
            () => preview($value(), Infinity)
          )
        )),
        // By position: the keys of a map may preview alike, and a repeated key would drop a row
        for_($entries)(
          $entry => ValueBranch({
            $name: () => $entry().name,
            $value: () => $entry().value
          })
        ),
        if_($hasMore)(() => (
          ValueMore({
            onClick() {
              $limit(limit => limit + PAGE)
            }
          })(
            '… ',
            $rest,
            ' more, load the next ',
            PAGE
          )
        ))
      )
    )
  ), () => (
    ValueNode({
      name: $name
    })(
      $preview
    )
  ))
})
