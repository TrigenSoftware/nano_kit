import {
  type Signalish,
  type WritableSignal,
  when,
  provide,
  inject
} from 'nanoviews/store'
import {
  type Attributes,
  tr,
  component$,
  context$,
  effect$
} from 'nanoviews'
import { TableFocus$ } from './Table.js'
import styles from './TableRow.module.css'

export interface TableRowTree {
  /**
   * Name of the row: the accessible name of its chevron.
   */
  label: Signalish<string>
  /**
   * Expanded state of a row with children: its `TableTreeCell` gets the chevron. Leave unset for a leaf.
   */
  $expanded?: WritableSignal<boolean>
}

export interface TableRowProps extends Attributes<'tr'>, TableRowTree {
  /**
   * Depth in the tree, from 1. Indents the first cell by one chevron slot per level.
   */
  level?: number
  selected?: Signalish<boolean>
  /**
   * A row that names a group of rows: bold.
   */
  group?: Signalish<boolean>
}

/**
 * The tree state of the enclosing `TableRow`, for its `TableTreeCell`.
 * @returns Nothing: a leaf has none.
 */
export function TableRowTree$(): TableRowTree | undefined {
  return undefined
}

function levelOf(row: Element | null) {
  return Number(row?.getAttribute('aria-level'))
}

function parentOf(row: Element) {
  const level = levelOf(row)
  let parent = row.previousElementSibling

  while (parent && levelOf(parent) >= level) {
    parent = parent.previousElementSibling
  }

  return parent
}

// Where a key moves the focus from a row: the rows are flat siblings, their nesting is the level
const MOVES = /* @__PURE__ */ new Map<string, (row: Element) => Element | null>([
  ['ArrowDown', row => row.nextElementSibling],
  ['ArrowUp', row => row.previousElementSibling],
  ['Home', row => row.parentElement!.firstElementChild],
  ['End', row => row.parentElement!.lastElementChild],
  // Down to the first child: the next row, when it is a level deeper
  ['ArrowRight', row => (levelOf(row.nextElementSibling) > levelOf(row) ? row.nextElementSibling : null)],
  ['ArrowLeft', parentOf]
])

/**
 * Act on a key pressed on a focused row, the way a tree grid does.
 * @param row
 * @param key
 * @param $expanded - Expanded state of a row with children.
 * @returns Whether the key was one for the row.
 */
function press(row: HTMLElement, key: string, $expanded: WritableSignal<boolean> | undefined) {
  const opening = key === 'ArrowRight'
  const move = MOVES.get(key)

  if (key === 'Enter' || key === ' ') {
    row.click()
  } else if ($expanded && (opening || key === 'ArrowLeft') && $expanded() !== opening) {
    // Right opens a closed row and Left closes an open one; on a row that already is, they move
    $expanded(opening)
  } else if (move) {
    (move(row) as HTMLElement | null)?.focus()
  } else {
    return false
  }

  return true
}

/**
 * Row of a `Table`: a `TableTreeCell` first, then `TableCell`s. The rows share one tab stop:
 * up and down move between them, Home and End go to the ends, right opens a row or goes down
 * to its first child, left closes it or goes up to its parent, Enter and Space act as a click.
 */
export const TableRow = component$(({
  class: className,
  label,
  level = 1,
  $expanded,
  selected,
  group,
  onFocus,
  onKeyDown,
  ...restProps
}: TableRowProps, children) => {
  const {
    $active,
    $isActive
  } = inject(TableFocus$)
  // The identity of the row for the tab stop of its table
  const self = {}

  // A row that leaves with the tab stop gives it back to the table
  effect$(() => () => {
    if ($active() === self) {
      $active(undefined)
    }
  })

  return (
    context$(provide(TableRowTree$, {
      label,
      $expanded
    }))(
      tr({
        class: [
          className,
          styles.root,
          when(group, styles.group)
        ],
        'aria-level': level,
        'aria-expanded': $expanded,
        'aria-selected': selected,
        tabIndex: () => ($isActive(self) ? 0 : -1),
        style: {
          '--tableLevel': level
        },
        onFocus(event) {
          $active(self)
          onFocus?.(event)
        },
        onKeyDown(event) {
          // A key pressed on a control inside the row is the control's
          if (event.target === event.currentTarget && press(event.target, event.key, $expanded)) {
            event.preventDefault()
          }

          onKeyDown?.(event)
        },
        ...restProps
      })(
        ...children
      )
    )
  )
})
