import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'

export default defineConfig({
  build: {
    target: 'esnext',
    lib: {
      formats: ['es'],
      entry: {
        index: './src/index.ts'
      },
      fileName(_, entryName) {
        return `${entryName}.${process.env.NODE_ENV}.js`
      }
    },
    rolldownOptions: {
      external: ['agera'],
      output: {
        topLevelVar: false
      }
    },
    sourcemap: true,
    minify: false,
    emptyOutDir: false
  },
  test: {
    exclude: [...configDefaults.exclude, './package', './dist'],
    coverage: {
      reporter: ['lcovonly', 'text'],
      include: ['src/**/*']
    }
  }
})
