import { inject } from 'nanoviews/store'
import {
  span,
  pre,
  fragment,
  component$,
  if_,
  switch_,
  case_
} from 'nanoviews'
import {
  type NodeRecord,
  isOwnership,
  valueOf,
  bodyOf
} from '../../services/registry/index.js'
import { SignalsStore$ } from '../../stores/signals.js'
import typography from '../../uikit/typography.module.css'
import {
  Box,
  BoxHeader,
  BoxBody,
  BoxSubheader
} from '../../uikit/Box/index.js'
import { Button } from '../../uikit/Button/index.js'
import {
  Notice,
  NoticeActions
} from '../../uikit/Notice/index.js'
import { ValueTree } from '../../uikit/ValueTree/index.js'
import { ValueBranch } from './ValueBranch.js'
import styles from './Inspector.module.css'

function isValued(record: NodeRecord) {
  return !isOwnership(record) && record.kind !== 'selector'
}

/**
 * The value of the selected node as a tree, read from the node itself and never evaluated:
 * a computed out of date or not evaluated yet says so and offers to evaluate it once.
 * A computed shows the source it computes the value with under the value, and an effect, which has no value,
 * the source it runs in its place: the source tells one from another. The box stays when the selection moves
 * and follows it through its bindings.
 */
export const ValueBox = component$(() => {
  const {
    $selected,
    evaluate
  } = inject(SignalsStore$)
  // Shown while there is a selection alone, and the branch goes before its bindings would run again
  const $record = () => $selected()!
  const $state = () => $record().state
  const $value = () => valueOf($record())
  const $valued = () => isValued($record())
  const $effect = () => $record().kind === 'effect'
  const $computed = () => $record().kind === 'computed'
  const $body = () => bodyOf($record())
  const $label = () => `Value of ${$record().name.name}`
  // A signal is never stale the way a computed is: its pending write is its own business
  const $notice = () => ($record().kind === 'signal' ? undefined : $state())
  const $evaluated = () => $state() !== 'unevaluated'
  // A node reached through a link, its creation not seen, has no signal to read it with
  const $unreadable = () => !$record().signal?.deref()
  const actions = NoticeActions()(
    Button({
      variant: 'warning',
      disabled: $unreadable,
      onClick() {
        evaluate($record())
      }
    })(
      'Evaluate now'
    )
  )

  return (
    Box({
      class: [styles.box, styles.wide]
    })(
      BoxHeader()(
        () => ($effect() ? 'Body' : 'Value')
      ),
      BoxBody({
        class: styles.value
      })(
        switch_($notice)(
          case_('dirty', () => (
            Notice({
              tone: 'warning'
            })(
              'Stale: cached value.',
              actions
            )
          )),
          case_('unevaluated', () => (
            Notice({
              tone: 'warning'
            })(
              'Not evaluated yet.',
              actions
            )
          ))
        ),
        if_($valued)(() => fragment(
          if_($evaluated)(() => (
            ValueTree({
              label: $label
            })(
              ValueBranch({
                $value,
                defaultExpanded: true
              })
            )
          )),
          if_($computed)(() => fragment(
            BoxSubheader()('Compute'),
            pre({
              class: [typography.mono, styles.source]
            })(
              $body
            )
          ))
        ), () => (
          if_($effect)(
            () => (
              pre({
                class: [typography.mono, styles.source]
              })(
                $body
              )
            ),
            () => (
              span({
                class: typography.secondary
              })(
                'An effect has no value: it only runs.'
              )
            )
          )
        ))
      )
    )
  )
})
