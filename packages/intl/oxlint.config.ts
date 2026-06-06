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
    browser: true
  },
  rules: {
    'typescript/no-empty-object-type': 'off',
    'typescript/no-explicit-any': 'off',
    'typescript/unified-signatures': 'off',
    'eslint/no-cond-assign': 'off',
    'eslint/no-return-assign': 'off',
    'eslint/no-multi-assign': 'off'
  }
})
