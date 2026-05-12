import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { svelteTesting } from '@testing-library/svelte/vite'

export default defineConfig({
  plugins: [
    svelte(),
    svelteTesting()
  ],
  build: {
    target: 'esnext',
    lib: {
      formats: ['es'],
      entry: {
        browser: './src/browser.ts',
        index: './src/index.ts'
      }
    },
    rolldownOptions: {
      external: id => /^(svelte|@sveltejs|@nano_kit|\$app)\/?/.test(id),
      output: {
        topLevelVar: false
      }
    },
    sourcemap: true,
    minify: false,
    emptyOutDir: false
  },
  test: {
    alias: {
      '$app/navigation': new URL('./test/app-navigation.ts', import.meta.url).pathname,
      '$app/state': new URL('./test/app-state.ts', import.meta.url).pathname,
      '$app/server': new URL('./test/app-server.ts', import.meta.url).pathname
    },
    environment: 'happy-dom',
    exclude: [...configDefaults.exclude, './package'],
    coverage: {
      reporter: ['lcovonly', 'text'],
      include: ['src/**/*']
    }
  }
})
