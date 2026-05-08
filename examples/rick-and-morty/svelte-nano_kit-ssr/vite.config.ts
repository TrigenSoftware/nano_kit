import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import ssr from '@nano_kit/svelte-ssr/vite-plugin'

export default defineConfig({
  build: {
    target: 'esnext',
    minify: true
  },
  plugins: [
    svelte(),
    ssr({
      index: 'src/index.ts'
    })
  ]
})
