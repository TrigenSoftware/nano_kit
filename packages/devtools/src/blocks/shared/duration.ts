import type { DurationTone } from '../../uikit/Duration/index.js'

// From this long, in milliseconds, a run is worth a look
const SLOW_RUN = 1
// From this long, in milliseconds, a run takes a frame at 60 Hz
const FRAME = 16

/**
 * How the blocks show how long a run or a flush took: the tone of its `Duration`.
 * None while it is quick, a warning from a millisecond, danger from a frame.
 * @param ms - In milliseconds.
 * @returns The tone.
 */
export function durationTone(ms: number): DurationTone | undefined {
  return ms >= FRAME ? 'danger' : ms >= SLOW_RUN ? 'warning' : undefined
}
