import { defineConfig } from '@trigen/oxlint'
import baseConfig from '@trigen/oxlint-config'
import testConfig from '@trigen/oxlint-config/test'

export default defineConfig({
  ignorePatterns: ['**/dist/', '**/build/', '**/package/', '**/.astro/'],
  extends: [
    baseConfig,
    testConfig
  ],
  options: {
    typeAware: true,
    typeCheck: true
  },
  env: {
    browser: true
  },
  overrides: [
    {
      files: ['**/.size-limit.js'],
      plugins: ['import'],
      rules: {
        'import/no-default-export': 'off',
        'import/no-anonymous-default-export': 'off'
      }
    }
  ]
})
