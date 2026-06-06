import { defineConfig } from '@trigen/oxlint'
import moduleConfig from '@trigen/oxlint-config/module'
import tsTypeCheckedConfig from '@trigen/oxlint-config/typescript-type-checked'
import testConfig from '@trigen/oxlint-config/test'
import rootConfig from '../../oxlint.config.ts'

export default defineConfig({
  extends: [
    rootConfig,
    moduleConfig,
    tsTypeCheckedConfig,
    testConfig
  ],
  env: {
    node: true
  },
  rules: {
    'typescript/no-invalid-void-type': 'off',
    'eslint/no-return-assign': 'off',
    'eslint/no-multi-assign': 'off'
  }
})
