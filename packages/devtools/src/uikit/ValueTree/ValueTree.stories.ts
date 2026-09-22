import type {
  Meta,
  StoryObj
} from '@nanoviews/storybook'
import { signal } from 'nanoviews/store'
import {
  div,
  span
} from 'nanoviews'
import typography from '../typography.module.css'
import {
  Box,
  BoxBody,
  BoxHeader
} from '../Box/index.js'
import {
  ValueChildren,
  ValueMore,
  ValueNode,
  ValueTree
} from './index.js'

const meta: Meta<{
  expanded: boolean
}> = {
  title: 'UIKit/ValueTree',
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    expanded: {
      control: 'boolean'
    }
  },
  args: {
    expanded: true
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render({ expanded }) {
    const $item = signal(true)
    const $tags = signal(false)

    return (
      div({
        style: {
          width: '520px',
          height: '260px'
        }
      })(
        Box()(
          BoxHeader()('Value'),
          BoxBody()(
            ValueTree({
              label: 'Value of misty-lynx'
            })(
              ValueNode({
                $expanded: expanded
              })(
                'Array(120)',
                ValueChildren()(
                  ValueNode({
                    name: '0',
                    $expanded: $item
                  })(
                    '{id: 12, title: "Mechanical keyboard, 75%", qty: 1, price: 89, tags: Array(3)}',
                    ValueChildren()(
                      ValueNode({
                        name: 'id'
                      })(
                        '12'
                      ),
                      ValueNode({
                        name: 'title'
                      })(
                        '"Mechanical keyboard, 75%"'
                      ),
                      ValueNode({
                        name: 'tags',
                        $expanded: $tags
                      })(
                        'Array(3)',
                        ValueChildren()(
                          ValueNode({
                            name: '0'
                          })(
                            '"keyboard"'
                          ),
                          ValueNode({
                            name: '1'
                          })(
                            '"75%"'
                          ),
                          ValueNode({
                            name: '2'
                          })(
                            '"hot-swap"'
                          )
                        )
                      ),
                      ValueNode({
                        name: 'format'
                      })(
                        span({
                          class: typography.secondary
                        })(
                          'ƒ format(price)'
                        )
                      ),
                      ValueNode({
                        name: 'cart'
                      })(
                        span({
                          class: typography.secondary
                        })(
                          'Cart {…} circular'
                        )
                      )
                    )
                  ),
                  ValueNode({
                    name: '1',
                    $expanded: signal(false)
                  })(
                    '{id: 31, title: "Keycap set, ivory", qty: 1, price: 39, tags: Array(1)}',
                    ValueChildren()
                  ),
                  ValueNode({
                    name: '2',
                    $expanded: signal(false)
                  })(
                    '{id: 7, title: "USB-C cable, 2 m", qty: 1, price: 20, tags: Array(0)}',
                    ValueChildren()
                  ),
                  ValueMore()('… 117 more, load the next 50')
                )
              )
            )
          )
        )
      )
    )
  }
}
