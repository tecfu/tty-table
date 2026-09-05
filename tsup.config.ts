import { defineConfig } from "tsup"

export default defineConfig({
  entry: {
    index: "src/index.ts",
    cli: "src/cli.ts",
    browser: "src/browser.ts"
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  target: "es2020",
  outDir: "dist",
  noExternal: ["wcwidth"],
  // restore legacy CJS interop: require("tty-table") must be the callable factory
  footer: {
    js: ";if (typeof module !== \"undefined\" && typeof module.exports?.default === \"function\") { module.exports = Object.assign(module.exports.default, module.exports) }"
  }
})
