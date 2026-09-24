import {
  type Accessor,
  type Signalish,
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
import { PanelStore$ } from '../../stores/panel.js'
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
  striped: Signalish<boolean>
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
const LineRow = component$(({
  line,
  striped
}: LineRowProps) => {
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
      striped,
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
  // The number, the time and the duration of a transaction never change; the filter cuts its lines down
  const {
    id,
    time,
    duration
  } = $group()
  const outside = duration === undefined
  // A transaction is striped by its number, not by its place, which moves with every one that comes in above
  const parity = id % 2
  const $expanded = signal(false)
  // The slowest run is named once it is worth a look, when its time is set apart as well
  const $slowest = () => {
    const { slowest } = $group()

    return slowest && durationTone(slowest.self!) ? slowest : undefined
  }
  const $lines = () => $group().lines

  return fragment(
    TableRow({
      label: outside ? `Outside a flush, ${id}` : `Flush ${id}`,
      $expanded,
      group: true,
      striped: parity === 1
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
        () => summaryOf($group()),
        if_($slowest)(
          $run => fragment(
            span({
              class: typography.tertiary
            })(
              '· slowest'
            ),
            () => $run().record.name.name
          )
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
        CLOCK.format(time)
      )
    ),
    if_($expanded)(
      () => for_($lines, line => line)(
        // A line never changes; the lines of a transaction go on alternating from its row
        ($line, $index) => LineRow({
          line: $line(),
          striped: () => $index() % 2 === parity
        })
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
  const { $shown } = inject(LogStore$)
  const { $filter } = inject(PanelStore$)

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
        for_($shown, trackById)(
          $group => GroupRows({
            $group
          }),
          () => (
            tr()(
              td({
                class: [typography.secondary, styles.empty],
                colSpan: COLUMNS
              })(
                () => ($filter().trim()
                  ? 'Nothing in the log matches the filter.'
                  : 'Nothing yet: the log fills as the application updates.')
              )
            )
          )
        )
      )
    )
  )
})
