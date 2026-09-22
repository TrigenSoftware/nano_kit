import type {
  Meta,
  StoryObj
} from '@nanoviews/storybook'
import { p } from 'nanoviews'
import { LinkButton } from './LinkButton.js'

const meta: Meta<{
  disabled: boolean
}> = {
  title: 'UIKit/LinkButton',
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    disabled: {
      control: 'boolean'
    }
  },
  args: {
    disabled: false
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render(props) {
    return (
      p({
        style: {
          margin: '0'
        }
      })(
        'invalidated by ',
        LinkButton(props)('quiet-otter')
      )
    )
  }
}
