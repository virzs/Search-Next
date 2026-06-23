const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const prettierPlugin = require("eslint-plugin-prettier");
const prettierConfig = require("eslint-config-prettier");

const jestGlobals = {
  afterAll: "readonly",
  afterEach: "readonly",
  beforeAll: "readonly",
  beforeEach: "readonly",
  describe: "readonly",
  expect: "readonly",
  it: "readonly",
  jest: "readonly",
  test: "readonly",
};

module.exports = [
  {
    ignores: ["dist/**", "coverage/**", "node_modules/**", ".eslintrc.js"],
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "tsconfig.json",
        tsconfigRootDir: __dirname,
        sourceType: "module",
      },
      globals: jestGlobals,
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...(tsPlugin.configs.recommended?.rules ?? {}),
      ...(prettierConfig?.rules ?? {}),
      ...(prettierPlugin.configs.recommended?.rules ?? {}),
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
  },
];

