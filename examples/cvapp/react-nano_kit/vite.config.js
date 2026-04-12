import { join } from 'node:path'
import react from '@vitejs/plugin-react'
import postcssCustomMedia from 'postcss-custom-media'

export default {
  css: {
    devSourcemap: true,
    postcss: {
      plugins: [postcssCustomMedia()]
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      '~': join(import.meta.dirname, 'src')
    }
  }
}
