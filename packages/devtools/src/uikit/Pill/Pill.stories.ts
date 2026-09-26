import type {
  Meta,
  StoryObj
} from '@nanoviews/storybook'
import { Beacon } from '../Beacon/index.js'
import { Icon } from '../Icon/index.js'
import {
  Pill,
  PillSeparator
} from './index.js'

const meta: Meta<{
  dragging: boolean
}> = {
  title: 'UIKit/Pill',
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    dragging: {
      control: 'boolean'
    }
  },
  args: {
    dragging: false
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render(props) {
    return (
      Pill({
        ...props,
        label: 'Open nano_kit devtools'
      })(
        Icon({
          name: 'spark'
        }),
        'nano_kit',
        PillSeparator(),
        Beacon()
      )
    )
  }
}
