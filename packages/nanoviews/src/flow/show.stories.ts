import { signal } from 'kida'
import {
  type Meta,
  type StoryObj,
  nanoStory
} from '@nanoviews/storybook'
import {
  b,
  button
} from '../elements/elements.js'
import { show_ } from './show.js'

const meta: Meta<{
  visible: boolean
  text: string
}> = {
  title: 'Logic/show_'
}

export default meta

type Story = StoryObj<typeof meta>

export const StaticValue: Story = {
  render: nanoStory(() => show_(true, () => b()('shown')))
}

export const ReactiveValue: Story = {
  args: {
    visible: false
  },
  render: nanoStory(({ visible }) => show_(visible, () => b()('content')))
}

// The tree lives across the toggles: hiding parks it instead of destroying,
// and bindings keep it up to date while it is parked
export const KeptAlive: Story = {
  args: {
    visible: true,
    text: 'a'
  },
  render: nanoStory(({
    visible,
    text
  }) => show_(visible, () => b()(text)))
}

// Internal state survives the toggles: the count stays and the click keeps
// working, where `if_` would rebuild the counter from zero
export const Counter: Story = {
  args: {
    visible: true
  },
  render: nanoStory(({ visible }) => show_(visible, () => {
    const $count = signal(0)

    return button({
      onClick: () => $count($count() + 1)
    })('Count: ', $count)
  }))
}
