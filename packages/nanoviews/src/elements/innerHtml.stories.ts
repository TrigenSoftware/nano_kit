import {
  type Meta,
  type StoryObj,
  nanoStory
} from '@nanoviews/storybook'
import { div } from './elements.js'
import { dangerouslySetInnerHtml } from './innerHtml.js'

const meta: Meta<{
  html: string
}> = {
  title: 'Elements/Inner HTML'
}

export default meta

type Story = StoryObj<typeof meta>

export const StaticValue: Story = {
  render: nanoStory(() => dangerouslySetInnerHtml(div(), '<p>Hello, world!</p>'))
}

export const ReactiveValue: Story = {
  args: {
    html: '<p>Hello, world!</p>'
  },
  render: nanoStory(({ html }) => dangerouslySetInnerHtml(div(), html))
}
