import type {
  Meta,
  StoryObj
} from '@nanoviews/storybook'
import { Beacon } from './Beacon.js'

const meta: Meta<{
  active: boolean
}> = {
  title: 'UIKit/Beacon',
  component: Beacon,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    active: {
      control: 'boolean'
    }
  },
  args: {
    active: false
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
