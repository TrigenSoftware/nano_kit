import type { Meta, StoryObj } from '@nanoviews/storybook'
import { fn } from 'storybook/test'
import { nanoStory } from '@nanoviews/storybook'
import type { MouseEventHandler } from '../types/index.js'
import { createElement } from './element.js'

const meta: Meta<{
  text: string
  href: string | undefined
  onClick: MouseEventHandler
}> = {
  title: 'Internals/Elements/Element'
}

export default meta

type Story = StoryObj<typeof meta>

export const StaticPrimitiveChild: Story = {
  render: nanoStory(() => createElement('b')('Hello, world!'))
}

export const ReactivePrimitiveChild: Story = {
  args: {
    text: 'Hello, world!'
  },
  render: nanoStory(({ text }) => createElement('b')(text))
}

export const StaticPrimitiveAttribute: Story = {
  render: nanoStory(() => createElement('a', {
    href: '#'
  })('Link!'))
}

export const ReactivePrimitiveAttribute: Story = {
  args: {
    href: '#'
  },
  render: nanoStory(({ href }) => createElement('a', {
    href
  })('Link!'))
}

export const Events: Story = {
  args: {
    onClick: fn(),
    text: 'Click me!'
  },
  render: nanoStory(({ onClick, text }) => createElement('button', {
    onClick
  })(text))
}

export const Children: Story = {
  render: nanoStory(() => createElement('ul')(
    createElement('li')('One'),
    createElement('li')('Two'),
    createElement('li')('Three')
  ))
}

export const NoChildren: Story = {
  render: nanoStory(() => createElement('div')(
    createElement('hr'),
    '^ hr, br >',
    createElement('br'),
    '^ br, hr >',
    createElement('hr')
  ))
}
