import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'

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
      external: [/^nanoviews/, /^@nano_kit\//],
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
    setupFiles: ['@nanoviews/testing-library/vitest'],
    server: {
      deps: {
        // Externalized, nanoviews would be run by Node, which cannot resolve
        // the workspace kida and agera sources it is overridden to.
        inline: [/\/nanoviews\//, /@nanoviews\//]
      }
    },
    exclude: [...configDefaults.exclude, './package', './dist', './storybook-static'],
    coverage: {
      provider: 'v8',
      reporter: ['lcovonly', 'text'],
      include: ['src/**/*'],
      exclude: ['src/**/*.stories.ts']
    }
  }
})
