import { defineConfig } from '@trigen/oxlint'
import rootConfig from '../../oxlint.config.ts'

export default defineConfig({
  extends: [
    rootConfig
  ],
  rules: {
    'typescript/no-explicit-any': 'off',
    'typescript/no-magic-numbers': 'off',
    'typescript/no-unsafe-enum-comparison': 'off',
    'typescript/no-unsafe-assignment': 'off',
    'typescript/prefer-for-of': 'off',
    'typescript/prefer-optional-chain': 'off',
    'eslint/no-param-reassign': 'off',
    'eslint/no-label-var': 'off',
    'eslint/no-labels': 'off',
    'eslint/no-constant-condition': 'off',
    'eslint/no-multi-assign': 'off',
    'eslint/no-sequences': 'off'
  }
})
