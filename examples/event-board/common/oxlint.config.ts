import { defineConfig } from '@trigen/oxlint'
import bundlerConfig from '@trigen/oxlint-config/bundler'
import tsConfig from '@trigen/oxlint-config/typescript'
import testConfig from '@trigen/oxlint-config/test'
import rootConfig from '../../../oxlint.config.ts'

export default defineConfig({
  // These files import the variant-local intl service/store, which does not
  // exist in common — they are linted in each variant after `pnpm sync`
  ignorePatterns: [
    'src/services/api/api.server.ts',
    'src/stores-di/user.ts'
  ],
  extends: [
    rootConfig,
    bundlerConfig,
    tsConfig,
    testConfig
  ],
  env: {
    node: true
  },
  rules: {
    'eslint/no-magic-numbers': 'off',
    'import/no-default-export': 'off'
  }
})
