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
  esbuildPlugins: [
    {
      // adapters stay external runtime files (adapters/ ships in the npm
      // package); they require ../dist/index.js, so they must not be pulled
      // into the bundle. esbuild resolves relative externals before matching,
      // hence the plugin instead of the external option
      name: "externalize-adapters",
      setup(build) {
        build.onResolve({ filter: /adapters\// }, (args) =>
          args.path.includes("../adapters/") ? { external: true } : undefined)
      }
    }
  ],
  noExternal: ["wcwidth"],
  // restore legacy CJS interop: require("tty-table") must be the callable factory
  footer: {
    js: ";if (typeof module !== \"undefined\" && typeof module.exports?.default === \"function\") { module.exports = Object.assign(module.exports.default, module.exports) }"
  }
})
