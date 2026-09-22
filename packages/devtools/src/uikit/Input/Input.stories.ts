import type {
  Meta,
  StoryObj
} from '@nanoviews/storybook'
import { div } from 'nanoviews'
import { Input } from './Input.js'

const meta: Meta<{
  value: string
  placeholder: string
  disabled: boolean
}> = {
  title: 'UIKit/Input',
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    value: {
      control: 'text'
    },
    placeholder: {
      control: 'text'
    },
    disabled: {
      control: 'boolean'
    }
  },
  args: {
    value: '',
    placeholder: 'Filter by name or file',
    disabled: false
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render({ value, ...props }) {
    return (
      div({
        style: {
          width: '240px'
        }
      })(
        Input({
          ...props,
          type: 'search',
          value
        })
      )
    )
  }
}
