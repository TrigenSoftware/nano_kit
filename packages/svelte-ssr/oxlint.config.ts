import { defineConfig } from '@trigen/oxlint'
import moduleConfig from '@trigen/oxlint-config/module'
import tsTypeCheckedConfig from '@trigen/oxlint-config/typescript-type-checked'
import rootConfig from '../../oxlint.config.ts'

export default defineConfig({
  extends: [
    rootConfig,
    moduleConfig,
    tsTypeCheckedConfig
  ],
  env: {
    node: true
  },
  rules: {
    'trigen/naming-convention': 'off',
    'eslint/no-console': 'off',
    'eslint/no-return-assign': 'off',
    'import/no-default-export': 'off',
    'stylistic-js/indent': 'off',
    'eslint/no-undef': 'off',
    'import/export': 'off'
  }
})
