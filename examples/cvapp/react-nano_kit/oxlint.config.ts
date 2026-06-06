import { defineConfig } from '@trigen/oxlint'
import baseConfig from '@trigen/oxlint-config'
import bundlerConfig from '@trigen/oxlint-config/bundler'
import reactConfig from '@trigen/oxlint-config/react'
import tsTypeCheckedConfig from '@trigen/oxlint-config/typescript-type-checked'
import testConfig from '@trigen/oxlint-config/test'

export default defineConfig({
  ignorePatterns: [
    '**/dist/'
  ],
  extends: [
    baseConfig,
    bundlerConfig,
    reactConfig,
    tsTypeCheckedConfig,
    testConfig
  ],
  env: {
    browser: true
  },
  rules: {
    'typescript/no-invalid-void-type': 'off'
  }
})
