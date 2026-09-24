import {
  type Accessor,
  signal,
  inject
} from 'nanoviews/store'
import {
  type Attributes,
  span,
  tr,
  td,
  fragment,
  trackById,
  component$,
  for_,
  if_
} from 'nanoviews'
import type {
  LogGroup,
  LogLine,
  LogLineKind
} from '../../services/log/index.js'
import { LogStore$ } from '../../stores/log.js'
import { SignalsStore$ } from '../../stores/signals.js'
import typography from '../../uikit/typography.module.css'
import { Icon } from '../../uikit/Icon/index.js'
import { Tag } from '../../uikit/Tag/index.js'
import {
  Duration,
  formatDuration
} from '../../uikit/Duration/index.js'
import {
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  TableTreeCell
} from '../../uikit/Table/index.js'
import {
  LINE_TONES,
  LineDetail
} from '../LineDetail/index.js'
import { KIND_ICONS } from '../shared/kind.js'
import { durationTone } from '../shared/duration.js'
import styles from './Log.module.css'

const COLUMNS = 5
// The time of the day to the millisecond
const CLOCK = /* @__PURE__ */ new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  fractionalSecondDigits: 3,
  hourCycle: 'h23'
})
// How the summary of a group counts its lines: of a kind, one and more
const COUNTS: [kind: LogLineKind, one: string, more: string][] = [
  ['write', 'write', 'writes'],
  ['computed', 'computed', 'computed'],
  ['effect', 'effect', 'effects'],
  ['invalidated', 'invalidated', 'invalidated'],
  ['lifecycle', 'lifecycle', 'lifecycle'],
  ['stopped', 'stopped', 'stopped']
]

export type LogProps = Attributes<'div'>

interface GroupRowsProps {
  $group: Accessor<LogGroup>
}

interface LineRowProps {
  line: LogLine
}

function summaryOf({ counts }: LogGroup) {
  return COUNTS
    .filter(([kind]) => counts[kind])
    .map(([kind, one, more]) => `${counts[kind]} ${counts[kind] === 1 ? one : more}`)
    .join(' · ')
}

/**
 * A line of a group: what happened to one node, and, for a run, how long it took.
 */
const LineRow = component$(({ line }: LineRowProps) => {
  const { select } = inject(SignalsStore$)
  const {
    record,
    depth,
    self,
    total
  } = line

  return (
    TableRow({
      label: record.name.name,
      level: 2,
      onClick() {
        select(record.id)
      }
    })(
      TableTreeCell(),
      TableCell({
        class: styles.event
      })(
        // A run caused by another one sits under it
        depth > 0 && span({
          class: styles.nested,
          style: {
            '--logDepth': depth
          }
        }),
        Tag({
          tone: LINE_TONES[line.kind]
        })(
          line.kind
        ),
        Icon({
          name: KIND_ICONS[record.kind]
        }),
        record.name.name,
        LineDetail({
          line
        })
      ),
      TableCell({
        class: typography.secondary
      })(
        record.name.owner
      ),
      TableCell({
        align: 'end'
      })(
        self !== undefined && Duration({
          ms: self,
          tone: durationTone(self)
        }),
        total !== undefined && total !== self && span({
          class: typography.tertiary
        })(
          `· ${formatDuration(total)} total`
        )
      ),
      TableCell()
    )
  )
})
/**
 * The row of a transaction and, once it is opened, its lines.
 */
const GroupRows = component$(({ $group }: GroupRowsProps) => {
  // A group never changes once it is in the log
  const group = $group()
  const {
    id,
    duration,
    slowest
  } = group
  const outside = duration === undefined
  const $expanded = signal(false)

  return fragment(
    TableRow({
      label: outside ? `Outside a flush, ${id}` : `Flush ${id}`,
      $expanded,
      group: true
    })(
      TableTreeCell()(
        outside
          ? span({
            class: typography.secondary
          })(
            'outside'
          )
          : `#${id}`
      ),
      TableCell({
        class: styles.event
      })(
        summaryOf(group),
        slowest && fragment(
          span({
            class: typography.tertiary
          })(
            '· slowest'
          ),
          slowest.record.name.name
        )
      ),
      TableCell(),
      TableCell({
        align: 'end'
      })(
        !outside && Duration({
          ms: duration,
          tone: durationTone(duration)
        })
      ),
      TableCell({
        class: typography.secondary
      })(
        CLOCK.format(group.time)
      )
    ),
    if_($expanded)(
      () => fragment(
        ...group.lines.map(line => LineRow({
          line
        }))
      )
    )
  )
})

/**
 * The Log tab: the transactions of the application, a row per flush, newest first. A group opens
 * into what happened to each node, runs nested under the run that caused them, with the time each
 * one took on its own and with what it caused.
 */
export const Log = component$((props: LogProps) => {
  const { $groups } = inject(LogStore$)

  return (
    Table({
      label: 'Log',
      ...props
    })(
      TableHead()(
        TableHeadCell()('Flush'),
        TableHeadCell()('Event'),
        TableHeadCell()('Owner'),
        TableHeadCell({
          align: 'end'
        })(
          'Duration'
        ),
        TableHeadCell()('Time')
      ),
      TableBody()(
        for_($groups, trackById)(
          $group => GroupRows({
            $group
          }),
          () => (
            tr()(
              td({
                class: [typography.secondary, styles.empty],
                colSpan: COLUMNS
              })(
                'Nothing yet: the log fills as the application updates.'
              )
            )
          )
        )
      )
    )
  )
})
