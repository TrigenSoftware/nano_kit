import type {
  Meta,
  StoryObj
} from '@nanoviews/storybook'
import {
  effect,
  record
} from 'kida'
import { nanoStory } from '@nanoviews/storybook'
import {
  ul,
  li
} from '../elements/elements.js'
import {
  trackById,
  for_
} from './for.js'

const meta: Meta<{
  items: string[]
}> = {
  title: 'Logic/for_'
}

export default meta

type Story = StoryObj<typeof meta>

export const StaticValue: Story = {
  render: nanoStory(() => ul()(
    for_([
      'Yatoro',
      'Larl',
      'Collapse',
      'Mira',
      'Miposhka'
    ])(
      item => li()(item)
    )
  ))
}

export const ReactiveValue: Story = {
  args: {
    items: [
      'Yatoro',
      'Larl',
      'Collapse',
      'Mira',
      'Miposhka'
    ]
  },
  render: nanoStory(({ items }) => ul()(
    for_(items)(
      item => li()(item),
      () => li()('No items')
    )
  ))
}

interface Player {
  id: number
  name: string
}

export const EntitiesValue: StoryObj<{
  items: Player[]
  onEffect?(value: string): void
}> = {
  args: {
    items: [
      {
        id: 1,
        name: 'Yatoro'
      },
      {
        id: 2,
        name: 'Larl'
      },
      {
        id: 3,
        name: 'Collapse'
      },
      {
        id: 4,
        name: 'Mira'
      },
      {
        id: 5,
        name: 'Miposhka'
      }
    ]
  },
  render: nanoStory(({ onEffect, items }) => ul()(
    for_(items, trackById)(
      (item) => {
        const { $name } = record(item)

        if (onEffect) {
          effect(() => {
            onEffect($name())
          })
        }

        return li()($name)
      }
    )
  ))
}

