import { defineConfig } from '@trigen/oxlint'
import moduleConfig from '@trigen/oxlint-config/module'
import storybookConfig from '@trigen/oxlint-config/storybook'
import testConfig from '@trigen/oxlint-config/test'
import tsTypeCheckedConfig from '@trigen/oxlint-config/typescript-type-checked'
import rootConfig from '../../oxlint.config.ts'

export default defineConfig({
  extends: [
    rootConfig,
    moduleConfig,
    tsTypeCheckedConfig,
    testConfig,
    storybookConfig
  ],
  env: {
    node: true
  },
  rules: {
    'typescript/no-invalid-void-type': 'off',
    'typescript/restrict-template-expressions': 'off',
    'eslint/no-implicit-coercion': 'off',
    'typescript/consistent-return': 'off',
    'eslint/no-cond-assign': 'off',
    'eslint/no-return-assign': 'off',
    'eslint/no-multi-assign': 'off',
    'typescript/prefer-string-starts-ends-with': 'off',
    'eslint/no-param-reassign': 'off',
    'trigen/naming-convention': 'off'
  }
})
