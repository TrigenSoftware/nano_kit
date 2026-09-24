import type {
  Meta,
  StoryObj
} from '@nanoviews/storybook'
import { inject } from 'nanoviews/store'
import { PanelStore$ } from '../../stores/panel.js'
import { withMockApp } from '../shared/app.mock.js'
import { Panel } from './Panel.js'

const meta: Meta = {
  title: 'Blocks/Panel',
  decorators: [withMockApp()],
  parameters: {
    layout: 'fullscreen',
    tick: true
  }
}

export default meta

type Story = StoryObj<typeof meta>

// The panel as the story wants it: the stories share the settings kept in the storage
function PanelStory(open: boolean) {
  const panel = inject(PanelStore$)

  queueMicrotask(open ? panel.open : panel.close)

  return Panel()
}

export const Collapsed: Story = {
  render() {
    return PanelStory(false)
  }
}

export const Open: Story = {
  render() {
    return PanelStory(true)
  }
}
