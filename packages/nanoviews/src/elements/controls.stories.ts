import type {
  Meta,
  StoryObj
} from '@nanoviews/storybook'
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
  Indeterminate,
  $$value,
  $$checked,
  $$selected,
  $$files
} from './controls.js'

const meta: Meta<{
  value?: string
  values?: string[]
  checked?: boolean | typeof Indeterminate
  files?: File[]
  onChange?(value: unknown): void
}> = {
  title: 'Elements/Effect Attributes/Controls'
}

export default meta

export const TextInput: StoryObj<{
  value: string
  onChange(value: unknown): void
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
  value: string
  onChange(value: unknown): void
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
  value: string
  onChange(value: unknown): void
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
  values: string[]
  onChange(value: unknown): void
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
  checked: boolean | typeof Indeterminate
  onChange(value: unknown): void
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
  files: File[]
  onChange(value: unknown): void
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
