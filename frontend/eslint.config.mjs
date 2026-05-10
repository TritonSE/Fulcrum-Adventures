import antfu from "@antfu/eslint-config";

export default antfu({
  ignores: [
    ".expo/",
    "**/.expo/**/",
    "android/",
    "**/android/**/",
    "ios/",
    "**/ios/**/",
    "dist/",
    "**/dist/**/",
    "node_modules/",
    "**/node_modules/**/",
  ],

  stylistic: false,

  react: true,

  typescript: {
    tsconfigPath: "tsconfig.json",
    overrides: {
      "ts/no-shadow": ["error", { ignoreTypeValueShadow: true }],
      "ts/no-unsafe-unary-minus": "error",
      "ts/no-unused-expressions": "error",

      "ts/consistent-type-definitions": ["warn", "type"],
      "ts/no-use-before-define": "warn",
      "ts/prefer-readonly": "warn",
      "ts/prefer-regexp-exec": "warn",
    },
  },

  rules: {
    "unused-imports/no-unused-imports": [
      "warn",
      {
        varsIgnorePattern: "^_",
      },
    ],
    "array-callback-return": "error",
    eqeqeq: "error",
    "no-await-in-loop": "error",
    "no-constant-binary-expression": "error",
    "no-constructor-return": "error",
    "no-constant-condition": [
      "error",
      {
        checkLoops: false,
      },
    ],
    "no-promise-executor-return": "error",
    "no-self-compare": "error",
    "no-template-curly-in-string": "error",

    "object-shorthand": ["warn", "properties"],
    "import/consistent-type-specifier-style": ["warn", "prefer-top-level"],
    "perfectionist/sort-imports": [
      "warn",
      {
        groups: ["builtin", "external", "parent", "sibling", "index", "object", "type"],
        newlinesBetween: "always",
      },
    ],
    "perfectionist/sort-named-imports": ["warn"],
    "no-console": [
      "warn",
      {
        allow: ["warn", "error", "info"],
      },
    ],
    "no-case-declarations": "off",

    "ts/strict-boolean-expressions": "off",
    "ts/no-unnecessary-condition": "off",
    "ts/switch-exhaustiveness-check": "off",
    "ts/return-await": "off",
    "jsdoc/check-param-names": "off",

    "react/no-unknown-property": "off",
    "react/no-implicit-key": "off",
  },
});
