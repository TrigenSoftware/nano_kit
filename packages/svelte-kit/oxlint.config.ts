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
    node: true,
    svelte: true
  },
  rules: {
    'typescript/require-await': 'off',
    'typescript/unified-signatures': 'off',
    'eslint/no-return-assign': 'off',
    'eslint/no-multi-assign': 'off',
    'typescript/consistent-return': 'off',
    'stylistic-js/indent': 'off',
    'import/export': 'off',
    'eslint/no-undef': 'off'
  }
})
