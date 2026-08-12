import {
  type Meta,
  type StoryObj,
  nanoStory
} from '@nanoviews/storybook'
import type { Primitive } from '../types/index.js'
import {
  createTextNode,
  createTextNodeFromAccessor
} from './text.js'

const meta: Meta<{ value: Primitive }> = {
  title: 'Internals/Elements/Text'
}

export default meta

type Story = StoryObj<typeof meta>

export const StaticValue: Story = {
  render: nanoStory(() => createTextNode('Hello, world!'))
}

export const ReactiveValue: Story = {
  args: {
    value: 'Hello, world!'
  },
  render: nanoStory(({ value }) => createTextNodeFromAccessor(value))
}
