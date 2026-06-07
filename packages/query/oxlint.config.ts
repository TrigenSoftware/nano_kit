import { defineConfig } from '@trigen/oxlint'
import moduleConfig from '@trigen/oxlint-config/module'
import testConfig from '@trigen/oxlint-config/test'
import tsTypeCheckedConfig from '@trigen/oxlint-config/typescript-type-checked'
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
    'eslint/no-cond-assign': 'off',
    'eslint/no-multi-assign': 'off',
    'typescript/consistent-return': 'off',
    'eslint/no-return-assign': 'off',
    'eslint/max-classes-per-file': 'off',
    'eslint/func-names': 'off',
    'eslint/no-empty-function': 'off',
    'eslint/no-use-before-define': 'off',
    'typescript/no-empty-object-type': 'off',
    'typescript/unified-signatures': 'off'
  }
})
