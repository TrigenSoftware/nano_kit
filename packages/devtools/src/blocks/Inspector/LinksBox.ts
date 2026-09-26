import {
  type Accessor,
  inject
} from 'nanoviews/store'
import {
  div,
  ul,
  li,
  span,
  fragment,
  trackById,
  component$,
  for_
} from 'nanoviews'
import {
  type NodeRecord,
  isOwnership
} from '../../services/registry/index.js'
import { SignalsStore$ } from '../../stores/signals.js'
import typography from '../../uikit/typography.module.css'
import {
  Box,
  BoxHeader,
  BoxBody
} from '../../uikit/Box/index.js'
import { LinkButton } from '../../uikit/LinkButton/index.js'
import styles from './Inspector.module.css'

/**
 * What the selected node reads and what reads it, each a link to its own row. An effect has no row
 * and nothing to inspect: it shows its name and the place it was created in.
 */
export const LinksBox = component$(() => {
  const {
    $selectedDeps,
    $selectedSubs,
    select
  } = inject(SignalsStore$)
  const links = (title: string, $ends: Accessor<NodeRecord[]>) => (
    div({
      class: styles.side
    })(
      span({
        class: typography.caption
      })(
        title
      ),
      ul({
        class: styles.list
      })(
        for_($ends, trackById)(($end) => {
          // The kind and the name of a record never change
          const end = $end()

          return li()(
            isOwnership(end)
              ? fragment(
                span({
                  class: typography.secondary
                })(
                  end.name.name
                ),
                end.name.site && span({
                  class: [typography.tertiary, styles.site]
                })(
                  end.name.site
                )
              )
              : LinkButton({
                onClick() {
                  select(end.id)
                }
              })(
                end.name.name
              )
          )
        }, () => (
          li({
            class: typography.tertiary
          })(
            'none'
          )
        ))
      )
    )
  )

  return (
    Box({
      class: styles.box
    })(
      BoxHeader()('Links'),
      BoxBody({
        class: styles.links
      })(
        links('deps', $selectedDeps),
        links('subs', $selectedSubs)
      )
    )
  )
})
