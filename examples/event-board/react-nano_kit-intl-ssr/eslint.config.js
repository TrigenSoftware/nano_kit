import bundlerConfig from '@trigen/eslint-config/bundler'
import moduleConfig from '@trigen/eslint-config/module'
import tsConfig from '@trigen/eslint-config/typescript'
import env from '@trigen/eslint-config/env'
import rootConfig from '../../../eslint.config.js'

export default [
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
      '@typescript-eslint/no-magic-numbers': 'off',
      'import/no-default-export': 'off'
    }
  },
  ...moduleConfig.map(config => ({
    files: ['**/*.js', 'vite.config.ts'],
    ...config
  }))
]
