import { defineConfig } from '@trigen/oxlint'
import moduleConfig from '@trigen/oxlint-config/module'
import tsConfig from '@trigen/oxlint-config/typescript'
import rootConfig from '../../oxlint.config.ts'

export default defineConfig({
  extends: [
    rootConfig,
    moduleConfig,
    tsConfig
  ],
  env: {
    node: true
  }
})
