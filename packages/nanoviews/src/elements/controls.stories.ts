import type { Meta, StoryObj } from '@nanoviews/storybook'
import { fn } from 'storybook/test'
import { nanoStory } from '@nanoviews/storybook'
import { effect } from 'kida'
import {
  input,
  textarea,
  select,
  option
} from './elements.js'
import {
  $$value,
  Indeterminate,
  $$checked,
  $$selected,
  $$files
} from './controls.js'

const meta: Meta<{
  onChange?(value: unknown): void
  value?: string
  values?: string[]
  checked?: boolean | typeof Indeterminate
  files?: File[]
}> = {
  title: 'Elements/Effect Attributes/Controls'
}

export default meta

export const TextInput: StoryObj<{
  onChange(value: unknown): void
  value: string
}> = {
  args: {
    onChange: fn(),
    value: 'Hello, world!'
  },
  render: nanoStory(({ onChange, value }) => {
    if (onChange && value) {
      effect((warmup) => {
        const v = value()

        if (!warmup) {
          onChange(v)
        }
      })
    }

    return input({
      type: 'text',
      [$$value]: value
    })
  })
}

export const Textarea: StoryObj<{
  onChange(value: unknown): void
  value: string
}> = {
  args: {
    onChange: fn(),
    value: 'Hello, world!'
  },
  render: nanoStory(({ onChange, value }) => {
    if (onChange && value) {
      effect((warmup) => {
        const v = value()

        if (!warmup) {
          onChange(v)
        }
      })
    }

    return textarea({
      [$$value]: value
    })()
  })
}

export const Select: StoryObj<{
  onChange(value: unknown): void
  value: string
}> = {
  argTypes: {
    value: {
      control: 'radio',
      options: [
        'red',
        'green',
        'blue'
      ]
    }
  },
  args: {
    onChange: fn(),
    value: 'green'
  },
  render: nanoStory(({ onChange, value }) => {
    if (onChange && value) {
      effect((warmup) => {
        const v = value()

        if (!warmup) {
          onChange(v)
        }
      })
    }

    return select({
      [$$selected]: value
    })(
      option({
        value: 'red'
      })('Red'),
      option({
        value: 'green'
      })('Green'),
      option({
        value: 'blue'
      })('Blue')
    )
  })
}

export const MultipleSelect: StoryObj<{
  onChange(value: unknown): void
  values: string[]
}> = {
  argTypes: {
    values: {
      control: 'check',
      options: [
        'red',
        'green',
        'blue'
      ]
    }
  },
  args: {
    onChange: fn(),
    values: ['green']
  },
  render: nanoStory(({ onChange, values }) => {
    if (onChange && values) {
      effect((warmup) => {
        const v = values()

        if (!warmup) {
          onChange(v)
        }
      })
    }

    return select({
      [$$selected]: values
    })(
      option({
        value: 'red'
      })('Red'),
      option({
        value: 'green'
      })('Green'),
      option({
        value: 'blue'
      })('Blue')
    )
  })
}

export const Checkbox: StoryObj<{
  onChange(value: unknown): void
  checked: boolean | typeof Indeterminate
}> = {
  argTypes: {
    checked: {
      control: 'inline-radio',
      options: [
        true,
        false,
        Indeterminate
      ]
    }
  },
  args: {
    onChange: fn(),
    checked: true
  },
  render: nanoStory(({ onChange, checked }) => {
    if (onChange && checked) {
      effect((warmup) => {
        const v = checked()

        if (!warmup) {
          onChange(v)
        }
      })
    }

    return input({
      type: 'checkbox',
      [$$checked]: checked
    })
  })
}

export const Files: StoryObj<{
  onChange(value: unknown): void
  files: File[]
}> = {
  args: {
    onChange: fn(),
    files: []
  },
  render: nanoStory(({ onChange, files }) => {
    if (onChange && files) {
      effect((warmup) => {
        const v = files()

        if (!warmup) {
          onChange(v)
        }
      })
    }

    return input({
      type: 'file',
      [$$files]: files
    })
  })
}
