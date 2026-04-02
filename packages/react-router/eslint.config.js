import moduleConfig from '@trigen/eslint-config/module'
import reactConfig from '@trigen/eslint-config/react'
import tsTypeCheckedConfig from '@trigen/eslint-config/typescript-type-checked'
import testConfig from '@trigen/eslint-config/test'
import env from '@trigen/eslint-config/env'
import rootConfig from '../../eslint.config.js'

export default [
  ...rootConfig,
  ...moduleConfig,
  ...reactConfig,
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
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react/function-component-definition': 'off',
      'no-multi-assign': 'off'
    }
  }
]
