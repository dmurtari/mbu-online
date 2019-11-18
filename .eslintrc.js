module.exports = {
  root: true,
  env: {
    node: true,
    mocha: true
  },
  'extends': [
    '@vue/typescript'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'import/no-unresolved': 0,
    'import/no-unassigned-import': 0
  },
  parserOptions: {
    parser: '@typescript-eslint/parser'
  }
}
