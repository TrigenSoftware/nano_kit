import type {
  Decorator,
  Preview
} from '@nanoviews/storybook'
import theme from '../src/uikit/Theme/Theme.module.css'
import './preview.css'

// The tokens go on the body, so the whole preview frame follows the theme toggle.
const withTheme: Decorator = (story, context) => {
  document.body.classList.add(theme.root)
  document.body.classList.toggle(theme.light, context.globals.theme === 'light')

  return story()
}
const preview: Preview = {
  parameters: {
    actions: {
      argTypesRegex: '^on[A-Z].*'
    }
  },
  globalTypes: {
    theme: {
      description: 'Theme',
      toolbar: {
        icon: 'mirror',
        items: [
          {
            value: 'dark',
            title: 'Dark'
          },
          {
            value: 'light',
            title: 'Light'
          }
        ],
        dynamicTitle: true
      }
    }
  },
  initialGlobals: {
    theme: 'dark'
  },
  decorators: [withTheme]
}

export default preview
