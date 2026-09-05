import { defineConfig } from "tsup"
import { readFileSync } from "node:fs"

export default defineConfig({
  entry: { "tty-table": "src/browser.ts" },
  format: ["iife"],
  globalName: "TtyTable",
  target: "es2020",
  bundle: true,
  noExternal: ["wcwidth", "kleur", "strip-ansi", "smartwrap"],
  esbuildPlugins: [
    {
      // stub modules the browser never calls: yargs (smartwrap's CLI dep),
      // chalk (unused: style.ts falls back to kleur when process.stdout is
      // absent), node builtins pulled in by deps, object-inspect (needs util),
      // and the terminal adapters — same trick as the legacy browserify
      // build's --ignore flags
      name: "stub-browser-only-deps",
      setup(build) {
        build.onResolve({ filter: /^(chalk|yargs|util|os|fs|path|tty|object-inspect)$/ }, () => ({ path: "stub", namespace: "stub" }))
        build.onResolve({ filter: /adapters\// }, () => ({ path: "stub", namespace: "stub" }))
        build.onLoad({ filter: /.*/, namespace: "stub" }, (args) => ({
          contents: args.path === "stub" ? "module.exports = {}" : "module.exports = function () { return '' }",
          loader: "js"
        }))
      }
    },
    {
      // smartwrap assigns an undeclared `result` (implicit global) — illegal in
      // the strict-mode IIFE bundle; declare it before the loop
      name: "patch-smartwrap-strict-mode",
      setup(build) {
        build.onLoad({ filter: /smartwrap[\\/]src[\\/]main\.js$/ }, (args) => ({
          contents: readFileSync(args.path, "utf8")
            .replace("while((result = ANSIRegex.exec(text))", "var result;\n  while((result = ANSIRegex.exec(text))"),
          loader: "js"
        }))
      }
    }
  ],
  sourcemap: true,
  define: { global: "globalThis" },
  clean: false,
  outDir: "dist/browser",
  banner: {
    // minimal process shim: style.ts branches on process.stdout and kleur reads
    // process.env — browserify provided this implicitly, esbuild needs it explicit
    js: "var process = typeof process !== 'undefined' ? process : { env: {} };"
  },
})
