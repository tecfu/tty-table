import js from "@eslint/js"
import tseslint from "typescript-eslint"

// examples/, adapters/, npm_scripts/ and the mocha harness are plain CommonJS
// scripts that node runs directly. Without an environment declared for them,
// every require, console and process in those files reads as an undefined
// global - around 250 errors - which is the main reason `npm run lint` never
// made it into CI. The globals package is not a dependency of this repo, so the
// handful the scripts actually touch are listed here.
const nodeGlobals = {
  __dirname: "writable",
  __filename: "readonly",
  Buffer: "readonly",
  URL: "readonly",
  clearTimeout: "readonly",
  console: "readonly",
  exports: "writable",
  global: "readonly",
  setInterval: "readonly",
  setTimeout: "readonly",
  module: "readonly",
  process: "readonly",
  require: "readonly"
}

export default [
  {
    ignores: ["dist/**", "node_modules/**"]
  },
  js.configs.recommended,
  // Scoped to the TypeScript sources on purpose. The flat config ships
  // unscoped, so its no-unused-vars would otherwise fire on the CommonJS files
  // and disagree with the plain `no-unused-vars` their disable comments name.
  ...tseslint.configs.recommended.map((config) => ({ ...config, files: ["**/*.ts"] })),
  {
    files: ["**/*.ts"],
    rules: {
      // The public surface is intentionally loose-typed; see types.ts.
      "@typescript-eslint/no-explicit-any": "off"
    }
  },
  {
    files: [
      "examples/**/*.js",
      "adapters/**/*.js",
      "npm_scripts/**/*.js",
      "test/**/*.js"
    ],
    languageOptions: {
      sourceType: "commonjs",
      globals: nodeGlobals
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off"
    }
  }
]
