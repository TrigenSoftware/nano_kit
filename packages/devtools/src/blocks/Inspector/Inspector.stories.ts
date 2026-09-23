import type {
  Meta,
  StoryObj
} from '@nanoviews/storybook'
import { div } from 'nanoviews'
import { withMockApp } from '../shared/app.mock.js'
import { Inspector } from './Inspector.js'

const meta: Meta = {
  title: 'Blocks/Inspector',
  decorators: [withMockApp()],
  parameters: {
    tick: true
  },
  render() {
    return (
      div({
        style: {
          width: '1200px',
          height: '240px',
          display: 'flex'
        }
      })(
        Inspector({
          style: {
            flex: '1'
          }
        })
      )
    )
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Computed: Story = {
  parameters: {
    select: (ctx: any) => ctx.$total
  }
}

export const Collection: Story = {
  parameters: {
    select: (ctx: any) => ctx.$items
  }
}

export const Stale: Story = {
  parameters: {
    select: (ctx: any) => ctx.$titles
  }
}

export const Unevaluated: Story = {
  parameters: {
    select: (ctx: any) => ctx.$discount
  }
}

export const Child: Story = {
  parameters: {
    select: (ctx: any) => ctx.$user
  }
}

export const NothingSelected: Story = {
  parameters: {
    select: () => undefined
  }
}
