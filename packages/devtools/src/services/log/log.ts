import {
  type ReactiveNode,
  UpdateEvent,
  RunEvent,
  RunEndEvent,
  StopEvent,
  LifecycleEvent,
  FlushEvent
} from '@nano_kit/store'
import type { InspectorEvent } from '../inspector/index.js'
import { nameMatches } from '../naming/index.js'
import {
  type NodeRecord,
  valueOf,
  visitStale
} from '../registry/index.js'
import { preview } from '../values/index.js'
import type {
  LogEntry,
  LogGroup,
  LogLine,
  LogLineKind
} from './log.types.js'

/**
 * The lines a group keeps. The ones past it are counted, not kept.
 */
export const GROUP_LINES = 200

/**
 * The lines of a node `recentOf` gives.
 */
export const RECENT_LINES = 20

// A run of a computed or an effect that has not ended yet
interface Run {
  readonly node: ReactiveNode
  readonly line: LogLine | undefined
  readonly start: number
  // The time of the runs that ran inside it
  nested: number
}

function noLines(): Record<LogLineKind, number> {
  return {
    write: 0,
    computed: 0,
    effect: 0,
    invalidated: 0,
    lifecycle: 0,
    stopped: 0
  }
}

// A line the filter finds by the name of its node or by a value it tells of, the way the table finds a row
function lineMatches({
  record,
  from,
  to
}: LogLine, query: string) {
  return nameMatches(record.name, query)
    || from?.toLowerCase().includes(query)
    || to?.toLowerCase().includes(query)
}

function slowestOf(lines: LogLine[]) {
  return lines.reduce<LogLine | undefined>(
    (slowest, line) => (line.self !== undefined && line.self > (slowest?.self ?? -1) ? line : slowest),
    undefined
  )
}

/**
 * Put the events of a task into the transactions of the log: a group for each flush, closed by it,
 * and one for what came after the last flush of the task. A group opens with the first event after
 * the one before, whatever it is, and a group with no line is dropped. A run is timed from its
 * `RunEvent` to its `RunEndEvent`, and its own time leaves out the runs that came in between.
 * @param events - The events of a task, in their order.
 * @param recordOf - The record of a node: a line is written only for a node that has one.
 * @param nextId - The number of the next group.
 * @returns The groups, oldest first.
 */
export function groupEvents(
  events: InspectorEvent[],
  recordOf: (node: ReactiveNode) => NodeRecord | undefined,
  nextId: () => number
) {
  const groups: LogGroup[] = []
  // The runs that have not ended, the innermost last
  const runs: Run[] = []
  // The line of the last update of a node: its value after is the value before of the next
  // update of the node, or, with none, the value the node has once the task is over
  const pending = new Map<ReactiveNode, LogLine>()
  // What the group updated, to find what it left out of date
  const updated: ReactiveNode[] = []
  let lines: LogLine[] | undefined
  let counts = noLines()
  let start = 0
  const add = (kind: LogLineKind, record: NodeRecord, depth = runs.length) => {
    const line: LogLine = {
      kind,
      record,
      depth
    }

    if (lines!.length < GROUP_LINES) {
      lines!.push(line)
    }

    counts[kind]++

    return line
  }
  const close = (end?: number) => {
    const seen = new Set<ReactiveNode>()

    // What the updates left out of date got no event of its own, and nobody has read it since
    updated.forEach(node => visitStale(node, seen, (stale) => {
      const record = recordOf(stale)

      if (record) {
        add('invalidated', record, 0)
      }
    }))

    if (lines!.length) {
      groups.push({
        id: nextId(),
        time: performance.timeOrigin + start,
        duration: end === undefined ? undefined : end - start,
        lines: lines!,
        counts,
        slowest: slowestOf(lines!)
      })
    }

    updated.length = 0
    lines = undefined
    counts = noLines()
  }

  events.forEach((event) => {
    if (!lines) {
      lines = []
      start = event.time
    }

    if (event.kind === FlushEvent) {
      close(event.time)
    } else if (event.kind === RunEvent) {
      const record = recordOf(event.node)

      runs.push({
        node: event.node,
        line: record && add(record.kind === 'effect' ? 'effect' : 'computed', record),
        start: event.time,
        nested: 0
      })
    } else if (event.kind === RunEndEvent) {
      // A run begun before the log listened has nothing to end
      const index = runs.findLastIndex(run => run.node === event.node)

      if (index >= 0) {
        const [run] = runs.splice(index)
        const total = event.time - run.start

        if (run.line) {
          run.line.total = total
          run.line.self = total - run.nested
        }

        if (index) {
          runs[index - 1].nested += total
        }
      }
    } else if (event.kind === UpdateEvent) {
      const record = recordOf(event.node)
      const previous = pending.get(event.node)

      if (previous) {
        previous.to = preview(event.oldValue)
      }

      if (record) {
        const run = runs.at(-1)
        // A computed changes inside its own run, anything else is written
        const line = run?.node === event.node ? run.line : add('write', record)

        updated.push(event.node)

        if (line) {
          if ('oldValue' in event) {
            line.from = preview(event.oldValue)
          } else {
            line.first = true
          }

          pending.set(event.node, line)
        }
      }
    } else if (event.kind === LifecycleEvent) {
      const record = recordOf(event.node)

      if (record) {
        add('lifecycle', record).mounted = record.state === 'mounted'
      }
    } else if (event.kind === StopEvent) {
      const record = recordOf(event.node)

      if (record) {
        add('stopped', record)
      }
    }
  })

  if (lines) {
    close()
  }

  pending.forEach((line) => {
    line.to = preview(valueOf(line.record))
  })

  return groups
}

/**
 * The last lines of a node in the log.
 * @param groups - The groups of the log, newest first.
 * @param id - The id of the record of the node.
 * @returns Up to `RECENT_LINES` lines, newest first, each with the number of its group.
 */
export function recentOf(groups: LogGroup[], id: number) {
  const entries: LogEntry[] = []

  for (const group of groups) {
    if (entries.length === RECENT_LINES) {
      break
    }

    for (let index = group.lines.length - 1; index >= 0 && entries.length < RECENT_LINES; index--) {
      const line = group.lines[index]

      if (line.record.id === id) {
        entries.push({
          group: group.id,
          line
        })
      }
    }
  }

  return entries
}

/**
 * A group cut down to the lines a filter finds, by the name of the node or by a value, its counts and its
 * slowest run taken from those lines alone.
 * @param group - A group of the log.
 * @param query - The filter, lower case.
 * @returns The group itself when every line it keeps matches; none when no line does.
 */
export function filterGroup(group: LogGroup, query: string): LogGroup | undefined {
  const lines = group.lines.filter(line => lineMatches(line, query))

  if (lines.length === group.lines.length) {
    return group
  }

  if (lines.length) {
    const counts = noLines()

    lines.forEach((line) => {
      counts[line.kind]++
    })

    return {
      ...group,
      lines,
      counts,
      slowest: slowestOf(lines)
    }
  }

  return undefined
}
