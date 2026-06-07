import { defineConfig } from '@trigen/oxlint'
import rootConfig from '../../oxlint.config.ts'

export default defineConfig({
  extends: [
    rootConfig
  ],
  rules: {
    'typescript/no-unsafe-return': 'off',
    'typescript/no-explicit-any': 'off',
    'typescript/no-unsafe-argument': 'off',
    'typescript/no-unsafe-member-access': 'off',
    'typescript/no-unsafe-assignment': 'off',
    'eslint/no-empty-function': 'off',
    'typescript/unified-signatures': 'off',
    'eslint/no-magic-numbers': 'off',
    'typescript/no-redundant-type-constituents': 'off',
    'trigen/naming-convention': 'off',
    'eslint/no-return-assign': 'off',
    'eslint/func-names': 'off',
    'eslint/no-use-before-define': 'off',
    'eslint/max-classes-per-file': 'off',
    'typescript/prefer-string-starts-ends-with': 'off'
  }
})
