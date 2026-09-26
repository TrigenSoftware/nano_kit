import type {
  Meta,
  StoryObj
} from '@nanoviews/storybook'
import { div } from 'nanoviews'
import { LinkButton } from '../LinkButton/index.js'
import { Status } from '../Status/index.js'
import {
  Properties,
  Property
} from './index.js'

const meta: Meta = {
  title: 'UIKit/Properties',
  parameters: {
    layout: 'centered'
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render() {
    return (
      div({
        style: {
          width: '280px'
        }
      })(
        Properties()(
          Property({
            name: 'Name'
          })(
            'brave-heron'
          ),
          Property({
            name: 'Kind'
          })(
            'computed'
          ),
          Property({
            name: 'Owner'
          })(
            'Cart$'
          ),
          Property({
            name: 'Created'
          })(
            LinkButton()('cart.ts:24')
          ),
          Property({
            name: 'State'
          })(
            Status({
              tone: 'success'
            })(
              'mounted, evaluated'
            )
          ),
          Property({
            name: 'Last run'
          })(
            'flush #218, 12 ms ago'
          )
        )
      )
    )
  }
}
