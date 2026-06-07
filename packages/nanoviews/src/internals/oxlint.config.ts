import { defineConfig } from '@trigen/oxlint'
import rootConfig from '../../oxlint.config.ts'

export default defineConfig({
  extends: [
    rootConfig
  ],
  rules: {
    'eslint/no-magic-numbers': 'off',
    'typescript/no-explicit-any': 'off',
    'trigen/naming-convention': 'off',
    'typescript/no-this-alias': 'off',
    'typescript/prefer-optional-chain': 'off',
    'typescript/no-deprecated': 'off',
    'typescript/no-empty-object-type': 'off',
    'typescript/consistent-type-imports': 'off',
    'eslint/no-cond-assign': 'off',
    'eslint/no-return-assign': 'off',
    'eslint/no-multi-assign': 'off',
    'eslint/max-classes-per-file': 'off',
    'eslint/no-param-reassign': 'off'
  }
})
