import type {
  Meta,
  StoryObj
} from '@nanoviews/storybook'
import { div } from 'nanoviews'
import {
  type TagTone,
  Tag
} from './Tag.js'

const TONES: TagTone[] = [
  'info',
  'success',
  'warning',
  'danger',
  'muted'
]
const meta: Meta<{
  tone: TagTone
}> = {
  title: 'UIKit/Tag',
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
    tone: 'info'
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render(props) {
    return Tag(props)('write')
  }
}

export const Tones: Story = {
  render() {
    return (
      div({
        style: {
          display: 'flex',
          gap: '6px'
        }
      })(
        Tag({
          tone: 'info'
        })(
          'write'
        ),
        Tag({
          tone: 'success'
        })(
          'computed'
        ),
        Tag({
          tone: 'warning'
        })(
          'effect'
        ),
        Tag({
          tone: 'danger'
        })(
          'stopped'
        ),
        Tag({
          tone: 'muted'
        })(
          'lifecycle'
        )
      )
    )
  }
}
