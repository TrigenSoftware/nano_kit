import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // The core is linked from the workspace: pre-bundled, nanoviews of the DevTools panel
    // would get a copy of it of its own, apart from the one the app and the panel share
    exclude: ['nanoviews']
  },
  build: {
    target: 'esnext',
    minify: true
  }
})
