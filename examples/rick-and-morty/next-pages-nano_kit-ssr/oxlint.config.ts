import { defineConfig } from '@trigen/oxlint'
import bundlerConfig from '@trigen/oxlint-config/bundler'
import tsConfig from '@trigen/oxlint-config/typescript'
import rootConfig from '../../../oxlint.config.ts'

export default defineConfig({
  ignorePatterns: [
    'next-env.d.ts'
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
    'import/no-default-export': 'off',
    'import/no-absolute-path': 'off',
    'trigen/import-order': 'off'
  }
})
