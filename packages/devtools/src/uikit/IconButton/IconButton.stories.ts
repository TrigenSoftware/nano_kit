import type {
  Meta,
  StoryObj
} from '@nanoviews/storybook'
import { div } from 'nanoviews'
import {
  type IconName,
  Icon,
  icons
} from '../Icon/index.js'
import { IconButton } from './IconButton.js'

const meta: Meta<{
  icon: IconName
  label: string
  pressed: boolean
  disabled: boolean
}> = {
  title: 'UIKit/IconButton',
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    icon: {
      control: 'select',
      options: icons
    },
    label: {
      control: 'text'
    },
    pressed: {
      control: 'boolean'
    },
    disabled: {
      control: 'boolean'
    }
  },
  args: {
    icon: 'pause',
    label: 'Pause the log',
    pressed: false,
    disabled: false
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render({ icon, ...props }) {
    return (
      IconButton(props)(
        Icon({
          name: icon
        })
      )
    )
  }
}

export const Toolbar: Story = {
  render({ pressed }) {
    return (
      div({
        style: {
          display: 'flex',
          gap: '6px'
        }
      })(
        IconButton({
          label: 'Pause the log',
          pressed
        })(
          Icon({
            name: 'pause'
          })
        ),
        IconButton({
          label: 'Clear the log'
        })(
          Icon({
            name: 'clear'
          })
        ),
        IconButton({
          label: 'Switch to the light theme'
        })(
          Icon({
            name: 'sun'
          })
        ),
        IconButton({
          label: 'Close'
        })(
          Icon({
            name: 'close'
          })
        )
      )
    )
  }
}
