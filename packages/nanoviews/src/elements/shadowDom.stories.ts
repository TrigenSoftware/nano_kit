import {
  type Meta,
  type StoryObj,
  nanoStory
} from '@nanoviews/storybook'
import { div } from './elements.js'
import { shadow } from './shadowDom.js'

const meta: Meta = {
  title: 'Elements/Shadow DOM'
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: nanoStory(() => shadow(
    div({
      'data-testid': 'shadow-root'
    }),
    {
      mode: 'open'
    }
  )(
    'Nanoviews can shadow DOM!'
  ))
}
