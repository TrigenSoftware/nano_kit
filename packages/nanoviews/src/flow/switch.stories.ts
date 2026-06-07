import {
  type Meta,
  type StoryObj,
  nanoStory
} from '@nanoviews/storybook'
import { b } from '../elements/elements.js'
import {
  switch_,
  case_,
  default_
} from './switch.js'

const meta: Meta<{
  state: 'loading' | 'success' | 'error'
}> = {
  title: 'Logic/switch_'
}

export default meta

type Story = StoryObj<typeof meta>

export const StaticValue: Story = {
  render: nanoStory(() => switch_('loading')(
    case_('loading', () => b()('Loading')),
    case_('error', () => b()('Error')),
    default_(() => 'Success')
  ))
}

export const ReactiveValue: Story = {
  args: {
    state: 'loading'
  },
  render: nanoStory(({ state }) => switch_(state)(
    case_('loading', () => b()('Loading')),
    case_('error', () => b()('Error')),
    default_(() => 'Success')
  ))
}
