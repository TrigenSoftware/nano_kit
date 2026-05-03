import bundlerConfig from '@trigen/eslint-config/bundler'
import tsConfig from '@trigen/eslint-config/typescript'
import env from '@trigen/eslint-config/env'
import testConfig from '@trigen/eslint-config/test'
import rootConfig from '../../../eslint.config.js'

export default [
  ...rootConfig,
  ...bundlerConfig,
  ...tsConfig,
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
      'import/no-default-export': 'off'
    }
  }
]
