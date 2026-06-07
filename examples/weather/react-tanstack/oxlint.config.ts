import { defineConfig } from '@trigen/oxlint'
import bundlerConfig from '@trigen/oxlint-config/bundler'
import tsConfig from '@trigen/oxlint-config/typescript'
import reactConfig from '@trigen/oxlint-config/react'
import rootConfig from '../../../oxlint.config.ts'

export default defineConfig({
  extends: [
    rootConfig,
    bundlerConfig,
    tsConfig,
    reactConfig
  ],
  env: {
    node: true
  },
  rules: {
    'import/no-absolute-path': 'off'
  }
})
