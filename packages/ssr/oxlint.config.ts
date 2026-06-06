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
  rules: {
    'trigen/naming-convention': 'off',
    'typescript/no-explicit-any': 'off',
    'jsdoc/require-returns-description': 'off',
    'import/no-default-export': 'off',
    'typescript/consistent-return': 'off',
    'eslint/no-magic-numbers': 'off',
    'eslint/no-return-assign': 'off',
    'eslint/no-console': 'off',
    'eslint/no-control-regex': 'off',
    'typescript/no-redundant-type-constituents': 'off',
    'typescript/restrict-template-expressions': 'off'
  }
})
