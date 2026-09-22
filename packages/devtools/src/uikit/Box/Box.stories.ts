import type {
  Meta,
  StoryObj
} from '@nanoviews/storybook'
import { div } from 'nanoviews'
import typography from '../typography.module.css'
import {
  Box,
  BoxBody,
  BoxHeader
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
