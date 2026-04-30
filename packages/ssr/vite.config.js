import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'

export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        topLevelVar: false
      }
    }
  },
  test: {
    exclude: [...configDefaults.exclude, './package'],
    coverage: {
      reporter: ['lcovonly', 'text'],
      include: ['src/**/*']
    }
  }
})
