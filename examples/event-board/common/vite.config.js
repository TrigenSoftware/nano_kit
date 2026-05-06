import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'

export default defineConfig({
  build: {
    target: 'esnext'
  },
  test: {
    exclude: [...configDefaults.exclude, './package']
  }
})
