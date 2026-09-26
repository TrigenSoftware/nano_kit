import type {
  Meta,
  StoryObj
} from '@nanoviews/storybook'
import { div } from 'nanoviews'
import typography from '../typography.module.css'
import {
  Box,
  BoxBody,
  BoxHeader,
  BoxSubheader
} from './index.js'

const meta: Meta = {
  title: 'UIKit/Box',
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
          width: '320px',
          height: '168px'
        }
      })(
        Box()(
          BoxHeader()('Value'),
          BoxBody({
            class: typography.mono
          })(
            '148'
          )
        )
      )
    )
  }
}

export const Sections: Story = {
  render() {
    return (
      div({
        style: {
          width: '320px',
          height: '220px'
        }
      })(
        Box()(
          BoxHeader()('Value'),
          BoxBody({
            class: typography.mono,
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }
          })(
            '326',
            BoxSubheader()('Compute'),
            '() => $items().reduce((sum, item) => sum + item.qty * item.price, 0)'
          )
        )
      )
    )
  }
}
