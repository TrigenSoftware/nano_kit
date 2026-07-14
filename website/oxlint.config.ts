import { defineConfig } from '@trigen/oxlint'
import moduleConfig from '@trigen/oxlint-config/module'
import tsTypeCheckedConfig from '@trigen/oxlint-config/typescript-type-checked'
import rootConfig from '../oxlint.config.ts'

export default defineConfig({
  extends: [
    rootConfig,
    moduleConfig,
    tsTypeCheckedConfig
  ],
  env: {
    node: true
  },
  overrides: [
    {
      // Classic scripts served as static assets, not modules
      files: ['public/**'],
      rules: {
        'import/unambiguous': 'off'
      }
    }
  ]
})
