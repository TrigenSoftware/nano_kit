import {
  type Accessor,
  signal,
  pick,
  inject
} from 'nanoviews/store'
import {
  type Attributes,
  span,
  fragment,
  trackBy,
  trackById,
  component$,
  for_,
  if_
} from 'nanoviews'
import { previewOf } from '../../services/registry/index.js'
import { basename } from '../../services/naming/index.js'
import { RegistryStore$ } from '../../stores/registry.js'
import {
  type GraphGroup,
  type GraphRow,
  SignalsStore$
} from '../../stores/signals.js'
import typography from '../../uikit/typography.module.css'
import {
  type IconName,
  Icon
} from '../../uikit/Icon/index.js'
import { Status } from '../../uikit/Status/index.js'
import {
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  TableTreeCell
} from '../../uikit/Table/index.js'
import { STATE_TONES } from '../shared/state.js'
import { KIND_ICONS } from '../shared/kind.js'
import styles from './SignalsTable.module.css'

const COLUMNS = 6

export type SignalsTableProps = Attributes<'div'>

interface GroupRowsProps {
  $group: Accessor<GraphGroup>
}

interface NodeRowsProps {
  $row: Accessor<GraphRow>
  level: number
}

function groupTitle({ owner, reached }: GraphGroup) {
  return owner ?? (reached ? 'created before DevTools' : 'created by libraries')
}

// Nodes created at module level: the file itself is the owner
function isModule({ owner, file }: GraphGroup) {
  return file !== undefined && owner === basename(file)
}

function groupIcon(group: GraphGroup): IconName {
  return isModule(group) ? 'file' : 'token'
}

/**
 * The file shown next to the title of a group: none for a group without one and for a module,
 * whose title is the file already.
 * @param group
 * @returns The file name.
 */
function groupSite(group: GraphGroup) {
  return group.file === undefined || isModule(group) ? undefined : basename(group.file)
}

/**
 * A node and, below it, the child signals taken from it.
 */
const NodeRows = component$(({
  $row,
  level
}: NodeRowsProps) => {
  const { records } = inject(RegistryStore$)
  const {
    $isSelected,
    select
  } = inject(SignalsStore$)
  // The id stays the same for a key; the children come and go
  const {
    id,
    children
  } = $row()
  // The record the row was built from: its kind and its name never change. It stands in for a record
  // that left, whose row sits in a group that stays: the list of the group drops the row only after
  // the bindings of the row ran once more
  const built = records.get(id)!
  const $record = () => records.$get(id) ?? built
  const {
    kind,
    name
  } = built
  const $expanded = children.length ? signal(true) : undefined
  const $value = () => previewOf($record())
  const $state = () => $record().state
  const $deps = () => $record().deps.length || ''
  const $subs = () => $record().subs.length || ''
  const $children = () => $row().children
  const $selected = () => $isSelected(id)
  const kids = for_($children, trackById)(
    $child => NodeRows({
      $row: $child,
      level: level + 1
    })
  )

  return fragment(
    TableRow({
      label: name.name,
      level,
      $expanded,
      selected: $selected,
      onClick() {
        select(id)
      }
    })(
      TableTreeCell()(
        Icon({
          name: KIND_ICONS[kind]
        }),
        name.name,
        name.site && span({
          class: [typography.tertiary, styles.site]
        })(
          name.site
        )
      ),
      TableCell({
        class: typography.secondary
      })(
        kind
      ),
      TableCell({
        class: [typography.mono, styles.value]
      })(
        span({
          class: typography.truncate
        })(
          $value
        )
      ),
      TableCell()(
        Status({
          tone: pick(STATE_TONES, $state)
        })(
          $state
        )
      ),
      TableCell({
        class: typography.secondary,
        align: 'end'
      })(
        $deps
      ),
      TableCell({
        class: typography.secondary,
        align: 'end'
      })(
        $subs
      )
    ),
    $expanded
      ? if_($expanded)(
        () => kids
      )
      : kids
  )
})
/**
 * The row that names a group and, below it, the nodes of the group.
 */
const GroupRows = component$(({ $group }: GroupRowsProps) => {
  const $expanded = signal(true)
  // What a group is called stays the same for a key
  const group = $group()
  const title = groupTitle(group)
  const site = groupSite(group)
  const $rows = () => $group().rows

  return fragment(
    TableRow({
      label: title,
      $expanded,
      group: true
    })(
      TableTreeCell({
        colSpan: COLUMNS
      })(
        Icon({
          name: groupIcon(group)
        }),
        title,
        site && span({
          class: [typography.tertiary, styles.site]
        })(
          site
        )
      )
    ),
    if_($expanded)(() => (
      for_($rows, trackById)(
        $row => NodeRows({
          $row,
          level: 2
        })
      )
    ))
  )
})

/**
 * The Signals tab: the signals, computeds and selectors of the graph, grouped by where they were
 * created, with their values, their states and their links, kept current a row at a time.
 */
export const SignalsTable = component$((props: SignalsTableProps) => {
  const { $groups } = inject(SignalsStore$)

  return (
    Table({
      label: 'Signals',
      ...props
    })(
      TableHead()(
        TableHeadCell()('Name'),
        TableHeadCell()('Kind'),
        TableHeadCell()('Value'),
        TableHeadCell()('State'),
        TableHeadCell({
          align: 'end'
        })(
          'Deps'
        ),
        TableHeadCell({
          align: 'end'
        })(
          'Subs'
        )
      ),
      TableBody()(
        for_($groups, trackBy('key'))(
          $group => GroupRows({
            $group
          })
        )
      )
    )
  )
})
