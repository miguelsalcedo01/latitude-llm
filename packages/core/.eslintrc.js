/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['./node_modules/@latitude-data/eslint-config/library.js'],
  env: {
    node: true,
  },
  plugins: ['drizzle'],
  rules: {
    'drizzle/enforce-delete-with-where': 'error',
    'drizzle/enforce-update-with-where': 'error',
  },
}
