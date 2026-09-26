import { defineConfig } from '@trigen/oxlint'
import moduleConfig from '@trigen/oxlint-config/module'
import storybookConfig from '@trigen/oxlint-config/storybook'
import testConfig from '@trigen/oxlint-config/test'
import tsTypeCheckedConfig from '@trigen/oxlint-config/typescript-type-checked'
import rootConfig from '../../oxlint.config.ts'

export default defineConfig({
  extends: [
    rootConfig,
    moduleConfig,
    tsTypeCheckedConfig,
    testConfig,
    storybookConfig
  ],
  rules: {
    // Attribute objects mix `type` with `'aria-label'` on every element:
    // quoting every key whenever one is dashed hides the dashed ones.
    'stylistic-js/quote-props': ['error', 'as-needed'],
    // Views are laid out like JSX: a render that is nothing but the view
    // returns it from the arrow in parentheses, `component$(() => (` ... `))`,
    // and a view in a branch of a ternary is wrapped the same way, `cond ? null : (` ... `)`.
    'stylistic-js/no-extra-parens': [
      'error',
      'all',
      {
        nestedBinaryExpressions: false,
        ignoreJSX: 'multi-line',
        ignoredNodes: [
          'ArrowFunctionExpression[body.type=ConditionalExpression]',
          'ArrowFunctionExpression[body.type=CallExpression]',
          'ConditionalExpression[consequent.type=CallExpression]',
          'ConditionalExpression[alternate.type=CallExpression]'
        ]
      }
    ]
  },
  overrides: [
    {
      files: ['scripts/*.js'],
      env: {
        node: true
      }
    }
  ]
})
