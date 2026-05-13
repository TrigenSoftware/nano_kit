import adapter from '@sveltejs/adapter-auto'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

export default {
  kit: {
    adapter: adapter(),
    alias: {
      '#src': 'src',
      '#src/*': 'src/*'
    }
  },
  preprocess: vitePreprocess()
}
