import moduleConfig from '@trigen/eslint-config/module'
import tsConfig from '@trigen/eslint-config/typescript'
import env from '@trigen/eslint-config/env'
import rootConfig from '../../../eslint.config.js'

export default [
  ...rootConfig,
  ...moduleConfig,
  ...tsConfig,
  env.node,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      'import/no-default-export': 'off',
      'import/no-anonymous-default-export': 'off'
    }
  }
]
