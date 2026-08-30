import {
  type Meta,
  type StoryObj,
  nanoStory
} from '@nanoviews/storybook'
import {
  b,
  i
} from '../elements/elements.js'
import { swap_ } from './swap.js'

const meta: Meta<{
  tab: string
}> = {
  title: 'Logic/swap_'
}

export default meta

type Story = StoryObj<typeof meta>

export const StaticValue: Story = {
  render: nanoStory(() => swap_('static', value => b()(value)))
}

export const ReactiveValue: Story = {
  args: {
    tab: 'list'
  },
  render: nanoStory(({ tab }) => swap_(
    tab,
    tab => (tab === 'list' ? b()(tab) : i()(tab))
  ))
}
