import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import * as commands from './test/commands.js'

export default defineConfig({
  build: {
    target: 'esnext',
    lib: {
      formats: ['es'],
      entry: {
        index: './src/index.ts'
      }
    },
    rolldownOptions: {
      external: ['@nano_kit/store']
    },
    sourcemap: true,
    minify: false,
    emptyOutDir: false
  },
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      screenshotFailures: false,
      // screenshotDirectory: './__screenshots__',
      commands,
      instances: [
        {
          browser: 'chromium',
          viewport: {
            width: 1280,
            height: 720
          }
        }
      ]
    },
    exclude: [...configDefaults.exclude, './package'],
    coverage: {
      provider: 'v8',
      reporter: ['lcovonly', 'text'],
      include: ['src/**/*']
    }
  }
})
