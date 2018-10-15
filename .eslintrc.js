module.exports = {
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module',
    ecmaVersion: 2017,
  },
  extends: [
    'plugin:vue/recommended',
    'eslint:recommended',
    'google',
  ],
  env: {
    browser: true,
    es6: true,
  },
  plugins: [
    'vue'
  ],
  rules: {
    'require-jsdoc': 0,
    'no-empty': [
      'error', { allowEmptyCatch: true }
    ]
  }
};