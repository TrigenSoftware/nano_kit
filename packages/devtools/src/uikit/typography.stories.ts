import type {
  Meta,
  StoryObj
} from '@nanoviews/storybook'
import {
  div,
  span
} from 'nanoviews'
import typography from './typography.module.css'

const meta: Meta = {
  title: 'UIKit/Typography'
}

export default meta

type Story = StoryObj<typeof meta>

export const Classes: Story = {
  render() {
    return (
      div({
        style: {
          display: 'grid',
          gap: '8px'
        }
      })(
        div()('Body text, 12px on a 16px line'),
        div({
          class: typography.secondary
        })(
          'Secondary text'
        ),
        div({
          class: typography.tertiary
        })(
          'Tertiary text'
        ),
        div({
          class: typography.strong
        })(
          'Strong text'
        ),
        div({
          class: typography.caption
        })(
          'Caption'
        ),
        div({
          class: typography.mono
        })(
          'mono: Array(120) [{id: 12, qty: 1, …}]'
        ),
        div({
          class: typography.tabular
        })(
          span()('tabular '),
          span({
            class: typography.mono
          })(
            '14:02:11.408'
          )
        )
      )
    )
  }
}
