import type {
  Meta,
  StoryObj
} from '@nanoviews/storybook'
import {
  div,
  span
} from 'nanoviews'
import typography from '../typography.module.css'
import {
  type IconName,
  icons
} from './icons.js'
import { Icon } from './Icon.js'

const meta: Meta<{
  name: IconName
  size: number
}> = {
  title: 'UIKit/Icon',
  component: Icon,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    name: {
      control: 'select',
      options: icons
    },
    size: {
      control: {
        type: 'range',
        min: 8,
        max: 48
      }
    }
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'signal',
    size: 16
  }
}

export const Gallery: Story = {
  args: {
    size: 16
  },
  render({ size }) {
    return (
      div({
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 120px)',
          gap: '12px'
        }
      })(
        ...icons.map(name => div({
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }
        })(
          Icon({
            name,
            size
          }),
          span({
            class: typography.secondary
          })(
            name
          )
        ))
      )
    )
  }
}
