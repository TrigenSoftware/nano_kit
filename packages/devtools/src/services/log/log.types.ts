import type { NodeRecord } from '../registry/index.js'

/**
 * What a line of the log tells of.
 */
export type LogLineKind = 'write' | 'computed' | 'effect' | 'invalidated' | 'lifecycle' | 'stopped'

/**
 * One thing that happened to a node in a transaction. Plain data that keeps no application value,
 * only previews: the log outlives the values it tells of.
 */
export interface LogLine {
  readonly kind: LogLineKind
  /**
   * The record of the node when the line was written: its name, its kind, and its id to select it by.
   * It stays here once the node was collected and its record left the registry.
   */
  readonly record: NodeRecord
  /**
   * How many runs the line happened inside: a computed that an effect evaluated is one deeper than the effect.
   */
  readonly depth: number
  /**
   * The value before, as a line of preview. None for the first evaluation of a computed and for a line with no value.
   */
  from?: string
  /**
   * The value after, as a line of preview. None for a computed that ran and kept its value and for a line with no value.
   */
  to?: string
  /**
   * The first evaluation of a computed.
   */
  first?: true
  /**
   * Of a lifecycle line: mounted, or else unmounted.
   */
  mounted?: boolean
  /**
   * Of a run: its own time, the runs nested in it left out, in milliseconds.
   */
  self?: number
  /**
   * Of a run: its time with the runs nested in it, in milliseconds.
   */
  total?: number
}

/**
 * One transaction of the log: what happened up to the end of a flush, or after the last flush of a task.
 */
export interface LogGroup {
  /**
   * The number of the group, counted on through a clear.
   */
  readonly id: number
  /**
   * When the group began, in milliseconds of the epoch.
   */
  readonly time: number
  /**
   * How long the flush took, from the first event of the group to its end, in milliseconds.
   * None for what happened outside a flush.
   */
  readonly duration: number | undefined
  /**
   * The lines, up to a limit.
   */
  readonly lines: LogLine[]
  /**
   * How many lines of each kind the group has, the ones past the limit included.
   */
  readonly counts: Readonly<Record<LogLineKind, number>>
  /**
   * The run that took the longest by its own time.
   */
  readonly slowest: LogLine | undefined
}

/**
 * A line of the log with the number of its group.
 */
export interface LogEntry {
  readonly group: number
  readonly line: LogLine
}
