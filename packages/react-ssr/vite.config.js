import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
