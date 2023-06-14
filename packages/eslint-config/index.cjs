/* eslint-env node */
/* eslint-disable import/no-unused-modules */
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:promise/recommended",
    "plugin:security/recommended",
    "plugin:sonarjs/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "tsdoc"],
  rules: {
    "no-console": "warn",
    "tsdoc/syntax": "warn",
    "import/no-extraneous-dependencies": "error",
    "import/no-unused-modules": [
      "error",
      {
        missingExports: true,
        unusedExports: true,
      },
    ],
    "import/order": [
      "error",
      {
        alphabetize: { order: "asc", caseInsensitive: true },
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
          "object",
          "type",
        ],
      },
    ],
  },
  settings: {
    "import/resolver": {
      typescript: true,
      node: true,
    },
  },
  overrides: [
    {
      files: [
        "*.d.ts",
        "*.cjs",
        "*.mjs",
        "*.json",
        "*.config.js",
        "**/src/index.ts",
      ],
      excludedFiles: ["node_modules/**", "*.test.ts"],
      rules: {
        "import/no-unused-modules": "off",
      },
    },
  ],
}
