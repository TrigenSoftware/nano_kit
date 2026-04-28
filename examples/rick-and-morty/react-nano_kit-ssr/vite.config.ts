import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import ssr from '@nano_kit/react-ssr/vite-plugin'

export default defineConfig({
  build: {
    target: 'esnext',
    minify: true
  },
  plugins: [
    react(),
    ssr({
      index: 'src/index.tsx'
    })
  ]
})
