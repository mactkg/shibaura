module.exports = {
  "extends": "standard",
  "globals": {
    "Deno": true,
    "fetch": true
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "rules": {
    // rules from deno/.eslintrc.json
    "@typescript-eslint/array-type": ["error", "array-simple"],
    "@typescript-eslint/explicit-member-accessibility": ["off"],
    "@typescript-eslint/no-non-null-assertion": ["off"],
    "@typescript-eslint/no-parameter-properties": ["off"],
    "@typescript-eslint/no-unused-vars": [
      "error",
      { "argsIgnorePattern": "^_" }
    ],
    "no-console": "off",
    "no-undef": "warn",
    "function-paren-newline": "off",
    "semi": ["error", "never"]
  }
}
