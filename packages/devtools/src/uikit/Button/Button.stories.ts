import type {
  Meta,
  StoryObj
} from '@nanoviews/storybook'
import { Button } from './Button.js'

const meta: Meta<{
  variant: 'primary' | 'secondary' | 'warning'
  disabled: boolean
}> = {
  title: 'UIKit/Button',
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'warning']
    },
    disabled: {
      control: 'boolean'
    }
  },
  args: {
    variant: 'primary',
    disabled: false
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render(props) {
    return Button(props)('Apply')
  }
}

export const Secondary: Story = {
  args: {
    variant: 'secondary'
  },
  render(props) {
    return Button(props)('Cancel')
  }
}

export const Warning: Story = {
  args: {
    variant: 'warning'
  },
  render(props) {
    return Button(props)('Evaluate now')
  }
}
