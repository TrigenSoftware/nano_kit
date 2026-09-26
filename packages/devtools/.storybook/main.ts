import type { StorybookConfig } from '@nanoviews/storybook-vite'

const config: StorybookConfig = {
  framework: '@nanoviews/storybook-vite',
  stories: ['../src/**/*.stories.ts'],
  viteFinal(config) {
    // Pre-bundled, nanoviews would get a copy of the core of its own, apart from the one
    // `@nano_kit/store` builds the signals of the panel with: its effects would never hear of them
    config.optimizeDeps = {
      ...config.optimizeDeps,
      exclude: [...config.optimizeDeps?.exclude ?? [], 'nanoviews']
    }

    return config
  }
}

export default config
