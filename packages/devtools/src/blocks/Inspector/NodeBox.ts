import {
  pick,
  inject
} from 'nanoviews/store'
import {
  span,
  fragment,
  component$,
  if_
} from 'nanoviews'
import { SignalsStore$ } from '../../stores/signals.js'
import { STATE_TONES } from '../shared/state.js'
import { durationTone } from '../shared/duration.js'
import typography from '../../uikit/typography.module.css'
import {
  Box,
  BoxHeader,
  BoxBody
} from '../../uikit/Box/index.js'
import {
  Properties,
  Property
} from '../../uikit/Properties/index.js'
import { Status } from '../../uikit/Status/index.js'
import { Duration } from '../../uikit/Duration/index.js'
import styles from './Inspector.module.css'

/**
 * What the selected node is: its name, its kind, where it was created and by what, its state,
 * and how long its last run took, as the log saw it. The box stays when the selection moves
 * and follows it through its bindings.
 */
export const NodeBox = component$(() => {
  const {
    $selected,
    $selectedRecent
  } = inject(SignalsStore$)
  // Shown while there is a selection alone, and the branch goes before its bindings would run again
  const $record = () => $selected()!
  const $name = () => $record().name
  const $state = () => $record().state
  const $lastRun = () => $selectedRecent().find(entry => entry.line.self !== undefined)

  return (
    Box({
      class: styles.box
    })(
      BoxHeader()('Node'),
      BoxBody()(
        Properties()(
          Property({
            name: 'Name'
          })(
            () => $name().name
          ),
          Property({
            name: 'Kind'
          })(
            () => $record().kind
          ),
          Property({
            name: 'Owner'
          })(
            () => $name().owner ?? '—'
          ),
          Property({
            name: 'Created'
          })(
            () => $name().site ?? ($record().reached ? 'before DevTools' : 'by libraries')
          ),
          Property({
            name: 'State'
          })(
            Status({
              class: typography.strong,
              tone: pick(STATE_TONES, $state)
            })(
              $state
            )
          ),
          Property({
            name: 'Last run'
          })(
            if_($lastRun)(
              ($run) => {
                const $self = () => $run().line.self!

                return fragment(
                  Duration({
                    ms: $self,
                    tone: () => durationTone($self())
                  }),
                  span({
                    class: typography.tertiary
                  })(
                    () => ` #${$run().group}`
                  )
                )
              },
              () => '—'
            )
          )
        )
      )
    )
  )
})
