import { defineConfig } from '@trigen/oxlint'
import moduleConfig from '@trigen/oxlint-config/module'
import rootConfig from '../../oxlint.config.ts'

export default defineConfig({
  extends: [
    rootConfig,
    moduleConfig
  ],
  env: {
    node: true
  },
  rules: {
    'eslint/no-console': 'off',
    'eslint/no-magic-numbers': 'off',
    'eslint/no-unused-vars': 'off'
  }
})
