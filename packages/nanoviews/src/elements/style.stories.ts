import {
  type Meta,
  type StoryObj,
  nanoStory
} from '@nanoviews/storybook'
import { div } from './elements.js'
import { $$style } from './style.js'

const meta: Meta<{
  color: string
}> = {
  title: 'Elements/Effect Attributes/Style'
}

export default meta

type Story = StoryObj<typeof meta>

export const StaticValue: Story = {
  render: nanoStory(() => div({
    [$$style]: {
      color: 'green'
    }
  })('Hello, world!'))
}

export const ReactiveValue: Story = {
  args: {
    color: 'green'
  },
  render: nanoStory(({ color }) => div({
    [$$style]: {
      color
    }
  })('Hello, world!'))
}
