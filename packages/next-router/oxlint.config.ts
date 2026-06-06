import { defineConfig } from '@trigen/oxlint'
import moduleConfig from '@trigen/oxlint-config/module'
import reactConfig from '@trigen/oxlint-config/react'
import testConfig from '@trigen/oxlint-config/test'
import tsTypeCheckedConfig from '@trigen/oxlint-config/typescript-type-checked'
import rootConfig from '../../oxlint.config.ts'

export default defineConfig({
  extends: [
    rootConfig,
    moduleConfig,
    reactConfig,
    tsTypeCheckedConfig,
    testConfig
  ],
  env: {
    node: true
  },
  rules: {
    'typescript/no-empty-object-type': 'off',
    'eslint/no-use-before-define': 'off',
    'eslint/no-multi-assign': 'off',
    'typescript/consistent-return': 'off',
    'import/export': 'off'
  }
})
