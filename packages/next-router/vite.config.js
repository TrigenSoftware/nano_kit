import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    lib: {
      formats: ['es'],
      entry: {
        index: './src/index.ts'
      }
    },
    rolldownOptions: {
      external: id => /^(next|react|@nano_kit)\/?/.test(id),
      output: {
        codeSplitting: {
          groups: [
            {
              name(id, ctx) {
                const { code } = ctx.getModuleInfo(id)

                if (/^\s*['"]use client['"]/.test(code)) {
                  return 'client'
                }

                return null
              }
            }
          ]
        },
        banner(chunk) {
          if (chunk.name === 'client') {
            return `'use client';`
          }
        }
      }
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
