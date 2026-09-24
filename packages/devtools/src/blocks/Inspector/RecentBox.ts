import { inject } from 'nanoviews/store'
import {
  ul,
  li,
  span,
  component$,
  for_
} from 'nanoviews'
import { SignalsStore$ } from '../../stores/signals.js'
import typography from '../../uikit/typography.module.css'
import {
  Box,
  BoxHeader,
  BoxBody
} from '../../uikit/Box/index.js'
import { Tag } from '../../uikit/Tag/index.js'
import { Duration } from '../../uikit/Duration/index.js'
import {
  LINE_TONES,
  LineDetail
} from '../LineDetail/index.js'
import { durationTone } from '../shared/duration.js'
import styles from './Inspector.module.css'

/**
 * The log filtered to the selected node: the last things that happened to it, newest first, with
 * the number of their transaction and, for a run, how long it took. The box stays when the
 * selection moves and follows it through its bindings.
 */
export const RecentBox = component$(() => {
  const { $selectedRecent } = inject(SignalsStore$)

  return (
    Box({
      class: styles.box
    })(
      BoxHeader()('Recent'),
      BoxBody()(
        ul({
          class: styles.list
        })(
          for_($selectedRecent, entry => entry.line)(
            ($entry) => {
              // A line of the log never changes
              const {
                group,
                line
              } = $entry()

              return (
                li({
                  class: styles.recent
                })(
                  span({
                    class: typography.tertiary
                  })(
                    `#${group}`
                  ),
                  Tag({
                    tone: LINE_TONES[line.kind]
                  })(
                    line.kind
                  ),
                  LineDetail({
                    line
                  }),
                  line.self !== undefined && Duration({
                    ms: line.self,
                    tone: durationTone(line.self)
                  })
                )
              )
            },
            () => (
              li({
                class: typography.secondary
              })(
                'Nothing in the log yet.'
              )
            )
          )
        )
      )
    )
  )
})
