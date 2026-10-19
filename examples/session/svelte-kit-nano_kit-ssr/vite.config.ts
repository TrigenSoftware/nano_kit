import adapter from '@sveltejs/adapter-auto'
import { sveltekit } from '@sveltejs/kit/vite'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'esnext',
    minify: true
  },
  plugins: [
    sveltekit({
      adapter: adapter(),
      preprocess: vitePreprocess()
    })
  ]
})
