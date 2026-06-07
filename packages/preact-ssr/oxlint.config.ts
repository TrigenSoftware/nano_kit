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
    'eslint/no-console': 'off',
    'eslint/no-return-assign': 'off',
    'import/no-default-export': 'off',
    'import/export': 'off'
  }
})
