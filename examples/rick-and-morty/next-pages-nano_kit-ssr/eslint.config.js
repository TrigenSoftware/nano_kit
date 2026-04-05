import { globalIgnores } from 'eslint/config'
import bundlerConfig from '@trigen/eslint-config/bundler'
import tsConfig from '@trigen/eslint-config/typescript'
import env from '@trigen/eslint-config/env'
import rootConfig from '../../../eslint.config.js'

export default [
  globalIgnores(['next-env.d.ts']),
  ...rootConfig,
  ...bundlerConfig,
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
      'import/no-absolute-path': 'off',
      'import/order': 'off'
    }
  }
]
