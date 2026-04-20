import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import preact from '@preact/preset-vite'

export default defineConfig({
  plugins: [preact()],
  build: {
    target: 'esnext',
    lib: {
      formats: ['es'],
      entry: {
        index: './src/index.ts'
      }
    },
    rolldownOptions: {
      external: id => /^(preact|@nano_kit)\/?/.test(id)
    },
    sourcemap: true,
    minify: false,
    emptyOutDir: false
  },
  test: {
    environment: 'happy-dom',
    setupFiles: ['@testing-library/jest-dom/vitest'],
    exclude: [...configDefaults.exclude, './package'],
    coverage: {
      reporter: ['lcovonly', 'text'],
      include: ['src/**/*']
    }
  }
})
