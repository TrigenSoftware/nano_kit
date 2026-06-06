import { defineConfig } from '@trigen/oxlint'
import bundlerConfig from '@trigen/oxlint-config/bundler'
import tsConfig from '@trigen/oxlint-config/typescript'
import rootConfig from '../../../oxlint.config.ts'

export default defineConfig({
  ignorePatterns: [
    '.output',
    'dist',
    'node_modules'
  ],
  extends: [
    rootConfig,
    bundlerConfig,
    tsConfig
  ],
  env: {
    node: true
  },
  rules: {
    'import/no-default-export': 'off'
  }
})
