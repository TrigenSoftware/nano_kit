import type {
  Meta,
  StoryObj
} from '@nanoviews/storybook'
import {
  Tab,
  Tabs
} from './index.js'

const meta: Meta<{
  value: string
}> = {
  title: 'UIKit/Tabs',
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    value: {
      control: 'select',
      options: ['signals', 'log']
    }
  },
  args: {
    value: 'signals'
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render({ value }) {
    return (
      Tabs({
        label: 'View',
        $value: value
      })(
        Tab({
          value: 'signals'
        })(
          'Signals'
        ),
        Tab({
          value: 'log'
        })(
          'Log'
        )
      )
    )
  }
}

export const WithDisabled: Story = {
  render({ value }) {
    return (
      Tabs({
        label: 'View',
        $value: value
      })(
        Tab({
          value: 'signals'
        })(
          'Signals'
        ),
        Tab({
          value: 'log'
        })(
          'Log'
        ),
        Tab({
          value: 'queries',
          disabled: true
        })(
          'Queries'
        )
      )
    )
  }
}
