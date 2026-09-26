import type {
  Meta,
  StoryObj
} from '@nanoviews/storybook'
import { div } from 'nanoviews'
import {
  type DurationTone,
  Duration
} from './Duration.js'

const meta: Meta<{
  ms: number
  tone: DurationTone | undefined
}> = {
  title: 'UIKit/Duration',
  component: Duration,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    ms: {
      control: 'number'
    },
    tone: {
      control: 'select',
      options: ['none', 'warning', 'danger'],
      mapping: {
        none: undefined
      }
    }
  },
  args: {
    ms: 4.2,
    tone: 'warning'
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Tones: Story = {
  render() {
    return (
      div({
        style: {
          display: 'flex',
          gap: '6px'
        }
      })(
        Duration({
          ms: 0.04
        }),
        Duration({
          ms: 0.6
        }),
        Duration({
          ms: 4.2,
          tone: 'warning'
        }),
        Duration({
          ms: 23.5,
          tone: 'danger'
        })
      )
    )
  }
}
