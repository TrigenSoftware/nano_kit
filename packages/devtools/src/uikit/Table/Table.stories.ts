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
import { Icon } from '../Icon/index.js'
import { Status } from '../Status/index.js'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  TableTreeCell
} from './index.js'

const meta: Meta<{
  selected: boolean
}> = {
  title: 'UIKit/Table',
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    selected: {
      control: 'boolean'
    }
  },
  args: {
    selected: true
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render({ selected }) {
    const $expanded = signal(true)
    const $userExpanded = signal(true)
    const $recordExpanded = signal(true)

    return (
      div({
        style: {
          width: '960px'
        }
      })(
        Table({
          label: 'Signals'
        })(
          TableHead()(
            TableHeadCell()('Name'),
            TableHeadCell()('Kind'),
            TableHeadCell()('Value'),
            TableHeadCell()('State'),
            TableHeadCell({
              align: 'end'
            })(
              'Deps'
            ),
            TableHeadCell({
              align: 'end'
            })(
              'Subs'
            )
          ),
          TableBody()(
            TableRow({
              label: 'Cart$',
              level: 1,
              $expanded,
              group: true
            })(
              TableTreeCell({
                colSpan: 6
              })(
                Icon({
                  name: 'token'
                }),
                'Cart$',
                span({
                  class: typography.tertiary
                })(
                  'cart.ts'
                )
              )
            ),
            TableRow({
              label: 'quiet-otter',
              level: 2
            })(
              TableTreeCell()(
                Icon({
                  name: 'signal'
                }),
                'quiet-otter',
                span({
                  class: typography.tertiary
                })(
                  'cart.ts:18'
                )
              ),
              TableCell({
                class: typography.secondary
              })(
                'signal'
              ),
              TableCell({
                class: typography.mono
              })(
                'Array(3) [{id: 12, qty: 1, …}, …]'
              ),
              TableCell()(
                Status({
                  tone: 'success'
                })(
                  'mounted'
                )
              ),
              TableCell({
                class: typography.secondary,
                align: 'end'
              }),
              TableCell({
                class: typography.secondary,
                align: 'end'
              })(
                '3'
              )
            ),
            TableRow({
              label: 'brave-heron',
              level: 2,
              selected
            })(
              TableTreeCell()(
                Icon({
                  name: 'computed'
                }),
                'brave-heron',
                span({
                  class: typography.tertiary
                })(
                  'cart.ts:24'
                )
              ),
              TableCell({
                class: typography.secondary
              })(
                'computed'
              ),
              TableCell({
                class: typography.mono
              })(
                '148'
              ),
              TableCell()(
                Status({
                  tone: 'success'
                })(
                  'mounted'
                )
              ),
              TableCell({
                class: typography.secondary,
                align: 'end'
              })(
                '2'
              ),
              TableCell({
                class: typography.secondary,
                align: 'end'
              })(
                '2'
              )
            ),
            TableRow({
              label: 'misty-lynx',
              level: 2
            })(
              TableTreeCell()(
                Icon({
                  name: 'computed'
                }),
                'misty-lynx',
                span({
                  class: typography.tertiary
                })(
                  'cart.ts:31'
                )
              ),
              TableCell({
                class: typography.secondary
              })(
                'computed'
              ),
              TableCell({
                class: typography.mono
              })(
                'Array(120) [{…}, {…}, …]'
              ),
              TableCell()(
                Status({
                  tone: 'warning'
                })(
                  'dirty'
                )
              ),
              TableCell({
                class: typography.secondary,
                align: 'end'
              })(
                '3'
              ),
              TableCell({
                class: typography.secondary,
                align: 'end'
              })(
                '1'
              )
            ),
            TableRow({
              label: 'amber-moth',
              level: 2
            })(
              TableTreeCell()(
                Icon({
                  name: 'signal'
                }),
                'amber-moth',
                span({
                  class: typography.tertiary
                })(
                  'cart.ts:20'
                )
              ),
              TableCell({
                class: typography.secondary
              })(
                'signal'
              ),
              TableCell({
                class: typography.mono
              })(
                'null'
              ),
              TableCell()(
                Status({
                  tone: 'warning'
                })(
                  'unmounted, cleanup in 640 ms'
                )
              ),
              TableCell({
                class: typography.secondary,
                align: 'end'
              }),
              TableCell({
                class: typography.secondary,
                align: 'end'
              })(
                '0'
              )
            ),
            TableRow({
              label: 'User$',
              level: 1,
              $expanded: $userExpanded,
              group: true
            })(
              TableTreeCell({
                colSpan: 6
              })(
                Icon({
                  name: 'token'
                }),
                'User$',
                span({
                  class: typography.tertiary
                })(
                  'user.ts'
                )
              )
            ),
            TableRow({
              label: 'soft-badger',
              level: 2,
              $expanded: $recordExpanded
            })(
              TableTreeCell()(
                Icon({
                  name: 'signal'
                }),
                'soft-badger',
                span({
                  class: typography.tertiary
                })(
                  'user.ts:12'
                )
              ),
              TableCell({
                class: typography.secondary
              })(
                'signal'
              ),
              TableCell({
                class: typography.mono
              })(
                '{id: 42, name: "Dan", plan: "pro"}'
              ),
              TableCell()(
                Status({
                  tone: 'success'
                })(
                  'mounted'
                )
              ),
              TableCell({
                class: typography.secondary,
                align: 'end'
              }),
              TableCell({
                class: typography.secondary,
                align: 'end'
              })(
                '2'
              )
            ),
            TableRow({
              label: 'soft-badger.$name',
              level: 3
            })(
              TableTreeCell()(
                Icon({
                  name: 'child'
                }),
                'soft-badger.$name'
              ),
              TableCell({
                class: typography.secondary
              })(
                'child'
              ),
              TableCell({
                class: typography.mono
              })(
                '"Dan"'
              ),
              TableCell()(
                Status({
                  tone: 'success'
                })(
                  'mounted'
                )
              ),
              TableCell({
                class: typography.secondary,
                align: 'end'
              })(
                '1'
              ),
              TableCell({
                class: typography.secondary,
                align: 'end'
              })(
                '1'
              )
            )
          )
        )
      )
    )
  }
}
