module.exports = {
  plugins: ['jest'],
  rules: {
    'space-before-function-paren': ['error', {
      anonymous: 'never',
      named: 'never',
      asyncArrow: 'never'
    }],
    camelcase: 'off'
  },
  env: {
    'jest/globals': true
  },
  "globals": {
    "pgb": true
  },
  extends: ['plugin:jest/recommended', 'standard']
}
