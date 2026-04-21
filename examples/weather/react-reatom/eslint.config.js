import moduleConfig from '@trigen/eslint-config/module'
import tsConfig from '@trigen/eslint-config/typescript'
import reactConfig from '@trigen/eslint-config/react'
import env from '@trigen/eslint-config/env'
import rootConfig from '../../../eslint.config.js'

export default [
  ...rootConfig,
  ...moduleConfig,
  ...tsConfig,
  ...reactConfig,
  env.node,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      'import/no-absolute-path': 'off'
    }
  }
]
