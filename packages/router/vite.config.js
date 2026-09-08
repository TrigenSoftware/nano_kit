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
      external: ['@nano_kit/store'],
      output: {
        topLevelVar: false
      }
    },
    sourcemap: true,
    minify: false,
    emptyOutDir: false
  },
  test: {
    environment: 'happy-dom',
    environmentOptions: {
      happyDOM: {
        settings: {
          disableJavaScriptFileLoading: true,
          disableCSSFileLoading: true,
          handleDisabledFileLoadingAsSuccess: true
        }
      }
    },
    setupFiles: ['@testing-library/jest-dom/vitest'],
    exclude: [...configDefaults.exclude, './package', './dist'],
    coverage: {
      reporter: ['lcovonly', 'text'],
      include: ['src/**/*']
    }
  }
})
