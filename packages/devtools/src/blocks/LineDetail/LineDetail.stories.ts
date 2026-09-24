import type {
  Meta,
  StoryObj
} from '@nanoviews/storybook'
import { div } from 'nanoviews'
import type { LogLine } from '../../services/log/index.js'
import type { NodeRecord } from '../../services/registry/index.js'
import { Tag } from '../../uikit/Tag/index.js'
import {
  LINE_TONES,
  LineDetail
} from './LineDetail.js'

// All a line reads of its record is where its node was created
const record = {
  name: {
    site: 'app.mock.ts:63'
  }
} as NodeRecord
const LINES: LogLine[] = [
  {
    kind: 'write',
    record,
    depth: 0,
    from: '1',
    to: '2'
  },
  {
    kind: 'computed',
    record,
    depth: 0,
    to: '148',
    first: true
  },
  {
    kind: 'computed',
    record,
    depth: 0,
    from: '148',
    to: '237'
  },
  {
    kind: 'computed',
    record,
    depth: 0
  },
  {
    kind: 'invalidated',
    record,
    depth: 0
  },
  {
    kind: 'lifecycle',
    record,
    depth: 0,
    mounted: true
  },
  {
    kind: 'lifecycle',
    record,
    depth: 0,
    mounted: false
  },
  {
    kind: 'effect',
    record,
    depth: 0
  },
  {
    kind: 'stopped',
    record,
    depth: 0
  }
]
const meta: Meta = {
  title: 'Blocks/LineDetail',
  parameters: {
    layout: 'centered'
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Kinds: Story = {
  render() {
    return (
      div({
        style: {
          display: 'grid',
          gap: '6px'
        }
      })(
        ...LINES.map(line => (
          div({
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }
          })(
            Tag({
              tone: LINE_TONES[line.kind]
            })(
              line.kind
            ),
            LineDetail({
              line
            })
          )
        ))
      )
    )
  }
}
