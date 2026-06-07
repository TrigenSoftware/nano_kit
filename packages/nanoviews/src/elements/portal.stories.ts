import {
  type Meta,
  type StoryObj,
  nanoStory
} from '@nanoviews/storybook'
import { div } from '../elements/elements.js'
import { portal } from './portal.js'

const meta: Meta = {
  title: 'Elements/portal'
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: nanoStory(() => portal(
    () => document.body,
    div()('I wanna be in the body!')
  ))
}
