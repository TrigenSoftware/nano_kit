import { defineConfig } from '@trigen/oxlint'
import rootConfig from '../oxlint.config.ts'

export default defineConfig({
  extends: [
    rootConfig
  ],
  env: {
    node: true
  }
})
