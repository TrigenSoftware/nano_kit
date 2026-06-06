import { defineConfig } from '@trigen/oxlint'
import bundlerConfig from '@trigen/oxlint-config/bundler'
import tsConfig from '@trigen/oxlint-config/typescript'
import rootConfig from '../../../oxlint.config.ts'

export default defineConfig({
  extends: [
    rootConfig,
    bundlerConfig,
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
    'eslint/prefer-const': 'off'
  }
})
