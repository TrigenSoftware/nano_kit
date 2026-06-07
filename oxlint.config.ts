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
  }
})
