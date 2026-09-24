import {
  span,
  fragment,
  component$
} from 'nanoviews'
import type {
  LogLine,
  LogLineKind
} from '../../services/log/index.js'
import type { TagTone } from '../../uikit/Tag/index.js'
import typography from '../../uikit/typography.module.css'

/**
 * How the blocks show what a line of the log tells of: the tone of its `Tag`.
 */
export const LINE_TONES: Record<LogLineKind, TagTone> = {
  write: 'info',
  computed: 'success',
  effect: 'warning',
  invalidated: 'warning',
  lifecycle: 'muted',
  stopped: 'danger'
}

export interface LineDetailProps {
  line: LogLine
}

function change(from: string | undefined, to: string | undefined) {
  return span({
    class: typography.mono
  })(
    from,
    span({
      class: typography.tertiary
    })(
      ' → '
    ),
    to
  )
}

function note(text: string | undefined) {
  return span({
    class: typography.tertiary
  })(
    text
  )
}

/**
 * What happened to the node of a line, told after its name: a value and the one before it,
 * the first value of a computed, or where an effect was created.
 */
export const LineDetail = component$(({ line }: LineDetailProps) => {
  const {
    kind,
    record,
    from,
    to
  } = line

  if (kind === 'write') {
    return change(from, to)
  }

  if (kind === 'computed') {
    return line.first
      ? fragment(
        span({
          class: typography.mono
        })(
          to
        ),
        note('first evaluation')
      )
      : from === undefined
        ? note('ran, unchanged')
        : change(from, to)
  }

  if (kind === 'invalidated') {
    return note('not read, stays dirty')
  }

  if (kind === 'lifecycle') {
    return note(line.mounted ? 'mounted' : 'unmounted')
  }

  return note(record.name.site)
})
