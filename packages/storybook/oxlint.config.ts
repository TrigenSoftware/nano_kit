import { defineConfig } from '@trigen/oxlint'
import moduleConfig from '@trigen/oxlint-config/module'
import tsConfig from '@trigen/oxlint-config/typescript'
import rootConfig from '../../oxlint.config.ts'

export default defineConfig({
  extends: [
    rootConfig,
    moduleConfig,
    tsConfig
  ],
  env: {
    node: true
  },
  rules: {
    'typescript/no-explicit-any': 'off',
    'typescript/no-invalid-void-type': 'off',
    'typescript/no-empty-object-type': 'off',
    'typescript/no-unsafe-function-type': 'off'
  }
})
