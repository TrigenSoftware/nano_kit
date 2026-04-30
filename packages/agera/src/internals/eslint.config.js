import rootConfig from '../../eslint.config.js'

export default [
  ...rootConfig,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/prefer-for-of': 'off',
      'no-param-reassign': 'off',
      'no-label-var': 'off',
      'no-labels': 'off',
      'no-constant-condition': 'off',
      'no-multi-assign': 'off',
      'no-sequences': 'off'
    }
  }
]
