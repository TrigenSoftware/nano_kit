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
    rollupOptions: {
      external: id => /^(react|@nano_kit)\/?/.test(id),
      output: {
        manualChunks(id, meta) {
          const { code } = meta.getModuleInfo(id)

          if (/^\s*['"]use client['"]/.test(code)) {
            return 'client'
          }
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
