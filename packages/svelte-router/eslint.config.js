import moduleConfig from '@trigen/eslint-config/module'
import tsTypeCheckedConfig from '@trigen/eslint-config/typescript-type-checked'
import testConfig from '@trigen/eslint-config/test'
import env from '@trigen/eslint-config/env'
import rootConfig from '../../eslint.config.js'

export default [
  ...rootConfig,
  ...moduleConfig,
  ...tsTypeCheckedConfig,
  ...testConfig,
  env.node,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      '@typescript-eslint/unified-signatures': 'off',
      'no-multi-assign': 'off',
      'consistent-return': 'off'
    }
  }
]
