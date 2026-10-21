import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const linkedCore = !import.meta.resolve('@nano_kit/store').includes('/node_modules/')

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // nanoviews of the DevTools panel has to share one copy of the core with the app and the panel:
    // a core linked from the workspace is not pre-bundled, so nanoviews stays out of pre-bundling too,
    // while a core installed from npm is pre-bundled, and nanoviews joins it there
    exclude: linkedCore ? ['nanoviews'] : []
  },
  build: {
    target: 'esnext',
    minify: true
  }
})
