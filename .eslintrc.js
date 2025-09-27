module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: "airbnb-base",
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    "linebreak-style": 0,
    quotes: ["error", "double"],
    "comma-dangle": "off",
    "no-undef": "error", // Add this rule to catch undefined variables
    "import/no-extraneous-dependencies": 0,
    "no-restricted-syntax": [
      "error",
      {
        selector: "FunctionExpression",
        message: "Function expressions are not allowed."
      },
      {
        selector: "CallExpression[callee.name='setTimeout'][arguments.length!=2]",
        message: "setTimeout must always be invoked with two arguments."
      }
    ],
    "max-len": ["error", {
      code: 120, // Batas untuk kode adalah 120 karakter
      tabWidth: 2,
      ignoreComments: true, // Abaikan semua jenis komentar
      ignoreUrls: true, // Abaikan URL yang panjang
      ignoreStrings: true, // Abaikan string yang panjang
      ignoreTemplateLiterals: true, // Abaikan template literal (string dengan backtick ``)
      ignoreRegExpLiterals: true // Abaikan ekspresi regular
    }],
  },
};
