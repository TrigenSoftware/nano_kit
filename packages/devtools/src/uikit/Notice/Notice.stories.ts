import type {
  Meta,
  StoryObj
} from '@nanoviews/storybook'
import { div } from 'nanoviews'
import { Button } from '../Button/index.js'
import {
  type NoticeTone,
  Notice,
  NoticeActions
} from './Notice.js'

const TONES: NoticeTone[] = [
  'warning',
  'danger',
  'info'
]
const meta: Meta<{
  tone: NoticeTone
}> = {
  title: 'UIKit/Notice',
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
    tone: 'warning'
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render(props) {
    return (
      div({
        style: {
          width: '640px'
        }
      })(
        Notice(props)(
          'Stale: a dependency changed in flush #218 and nothing has read this computed since. Shown as cached, not re-evaluated.',
          NoticeActions()(
            Button({
              variant: 'warning'
            })(
              'Evaluate now'
            )
          )
        )
      )
    )
  }
}

export const WithoutActions: Story = {
  args: {
    tone: 'danger'
  },
  render(props) {
    return (
      div({
        style: {
          width: '640px'
        }
      })(
        Notice(props)('The last evaluation threw: TypeError: items is not iterable')
      )
    )
  }
}
