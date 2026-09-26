import type {
  Meta,
  StoryObj
} from '@nanoviews/storybook'
import { Disclosure } from './Disclosure.js'

const meta: Meta<{
  $expanded: boolean
  label: string
  disabled: boolean
}> = {
  title: 'UIKit/Disclosure',
  component: Disclosure,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    $expanded: {
      control: 'boolean'
    },
    disabled: {
      control: 'boolean'
    }
  },
  args: {
    $expanded: false,
    label: 'Toggle Cart$',
    disabled: false
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
