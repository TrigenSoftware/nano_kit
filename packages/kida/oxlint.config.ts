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
    'typescript/restrict-template-expressions': 'off',
    'typescript/unified-signatures': 'off',
    'typescript/no-redundant-type-constituents': 'off',
    'eslint/no-use-before-define': 'off',
    'typescript/no-extraneous-class': 'off',
    'eslint/no-implicit-coercion': 'off',
    'typescript/consistent-return': 'off',
    'eslint/symbol-description': 'off',
    'eslint/no-multi-assign': 'off',
    'eslint/no-return-assign': 'off',
    'eslint/max-classes-per-file': 'off',
    'eslint/no-sequences': 'off'
  }
})
