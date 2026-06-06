import {
  type Meta,
  type StoryObj,
  nanoStory
} from '@nanoviews/storybook'
import { createElement } from '../elements/index.js'
import {
  provide,
  context,
  inject
} from './context.js'

const meta: Meta = {
  title: 'Component/Context'
}

export default meta

type Story = StoryObj<typeof meta>

const ThemeContext = () => 'light'
const UserContext = () => 'Guest'

export const DefaultValue: Story = {
  render: nanoStory(
    () => context(() => createElement('div')('Default theme: ', inject(ThemeContext)))
  )
}

export const OneContext: Story = {
  render: nanoStory(
    () => context(
      [provide(ThemeContext, 'dark')],
      () => createElement('div')('Theme: ', inject(ThemeContext))
    )
  )
}

export const FewContexts: Story = {
  render: nanoStory(
    () => context(
      [provide(ThemeContext, 'dark'), provide(UserContext, 'Admin')],
      () => createElement('div')(
        'Theme: ',
        inject(ThemeContext),
        ' User: ',
        inject(UserContext)
      )
    )
  )
}
