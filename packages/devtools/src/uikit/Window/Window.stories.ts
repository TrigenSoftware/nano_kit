import type {
  Meta,
  StoryObj
} from '@nanoviews/storybook'
import {
  div,
  span
} from 'nanoviews'
import typography from '../typography.module.css'
import { Icon } from '../Icon/index.js'
import { IconButton } from '../IconButton/index.js'
import { Input } from '../Input/index.js'
import {
  Tab,
  Tabs
} from '../Tabs/index.js'
import {
  Window,
  WindowBar,
  WindowBarCenter,
  WindowBarEnd,
  WindowBarStart,
  WindowBody,
  WindowGrip
} from './index.js'

const meta: Meta<{
  tab: string
}> = {
  title: 'UIKit/Window',
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    tab: {
      control: 'select',
      options: ['signals', 'log']
    }
  },
  args: {
    tab: 'signals'
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render({ tab }) {
    return (
      div({
        style: {
          width: '1040px',
          height: '400px'
        }
      })(
        Window({
          label: 'nano_kit devtools'
        })(
          WindowBar()(
            WindowBarStart()(
              Icon({
                name: 'spark'
              }),
              span({
                class: typography.strong
              })(
                'nano_kit'
              ),
              span({
                class: typography.secondary
              })(
                'devtools'
              )
            ),
            WindowBarCenter()(
              Tabs({
                label: 'View',
                $value: tab
              })(
                Tab({
                  value: 'signals'
                })(
                  'Signals'
                ),
                Tab({
                  value: 'log'
                })(
                  'Log'
                )
              )
            ),
            WindowBarEnd()(
              div({
                style: {
                  width: '190px'
                }
              })(
                Input({
                  type: 'search',
                  placeholder: 'Filter by name or file'
                })
              ),
              IconButton({
                label: 'Switch to the light theme'
              })(
                Icon({
                  name: 'sun'
                })
              ),
              IconButton({
                label: 'Close'
              })(
                Icon({
                  name: 'close'
                })
              )
            )
          ),
          WindowBody()(
            div({
              class: typography.secondary,
              style: {
                padding: '12px'
              }
            })(
              'Body'
            )
          ),
          WindowGrip()
        )
      )
    )
  }
}
