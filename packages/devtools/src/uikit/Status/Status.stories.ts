import type {
  Meta,
  StoryObj
} from '@nanoviews/storybook'
import { div } from 'nanoviews'
import {
  type StatusTone,
  Status
} from './Status.js'

const TONES: StatusTone[] = [
  'success',
  'warning',
  'danger',
  'info',
  'muted'
]
const meta: Meta<{
  tone: StatusTone
}> = {
  title: 'UIKit/Status',
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    tone: {
      control: 'select',
      options: TONES
    }
  },
  args: {
    tone: 'success'
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render(props) {
    return Status(props)('mounted')
  }
}

export const Tones: Story = {
  render() {
    return (
      div({
        style: {
          display: 'grid',
          gap: '6px'
        }
      })(
        Status({
          tone: 'success'
        })(
          'mounted'
        ),
        Status({
          tone: 'warning'
        })(
          'unmounted, cleanup in 640 ms'
        ),
        Status({
          tone: 'danger'
        })(
          'threw'
        ),
        Status({
          tone: 'info'
        })(
          'evaluating'
        ),
        Status({
          tone: 'muted'
        })(
          'unevaluated'
        )
      )
    )
  }
}
