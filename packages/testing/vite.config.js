import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'

export default defineConfig({
  build: {
    target: 'esnext',
    lib: {
      formats: ['es'],
      entry: {
        index: './src/index.ts',
        'fetch/index': './src/fetch/index.ts',
        'backend/index': './src/backend/index.ts'
      }
    },
    rolldownOptions: {
      external: id => /^hono(\/|$)/.test(id),
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
      reporter: [
        [
          'lcovonly',
          {
            projectRoot: '../..'
          }
        ],
        'text'
      ],
      include: ['src/**/*']
    }
  }
})
