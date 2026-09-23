import type {
  Meta,
  StoryObj
} from '@nanoviews/storybook'
import { div } from 'nanoviews'
import { withMockApp } from '../shared/app.mock.js'
import { SignalsTable } from './SignalsTable.js'

const meta: Meta = {
  title: 'Blocks/SignalsTable',
  decorators: [withMockApp()],
  parameters: {
    tick: true
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render() {
    return (
      div({
        style: {
          width: '960px',
          height: '480px'
        }
      })(
        SignalsTable()
      )
    )
  }
}
