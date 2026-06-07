import { defineConfig } from '@trigen/oxlint'
import moduleConfig from '@trigen/oxlint-config/module'
import tsConfig from '@trigen/oxlint-config/typescript'
import rootConfig from '../../../oxlint.config.ts'

export default defineConfig({
  extends: [
    rootConfig,
    moduleConfig,
    tsConfig
  ],
  env: {
    node: true,
    svelte: true
  },
  rules: {
    'import/no-default-export': 'off',
    'stylistic-js/indent': 'off',
    'eslint/no-undef': 'off',
    'import/no-absolute-path': 'off',
    'import/unambiguous': 'off'
  }
})
