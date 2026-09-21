import { defineConfig } from "tsup"
import { readFileSync } from "node:fs"

export default defineConfig({
  entry: { "tty-table": "src/browser.ts" },
  format: ["iife"],
  globalName: "TtyTable",
  target: "es2020",
  bundle: true,
  noExternal: ["breakword", "chalk", "strip-ansi", "smartwrap"],
  esbuildPlugins: [
    {
      // Stub modules the browser never calls: yargs (smartwrap's CLI dep),
      // node builtins pulled in by deps, object-inspect (needs util),
      // and the terminal adapters — same trick as the legacy browserify
      // build's --ignore flags. Chalk 4's supports-color module also calls
      // tty.isatty() during initialization, so its browser stub needs that
      // one small part of the Node tty API.
      name: "stub-browser-only-deps",
      setup(build) {
        build.onResolve({ filter: /^(yargs|util|os|fs|path|tty|object-inspect)$/ }, (args) => ({
          path: args.path,
          namespace: "stub"
        }))
        build.onResolve({ filter: /adapters\// }, () => ({ path: "adapter", namespace: "stub" }))
        build.onLoad({ filter: /.*/, namespace: "stub" }, (args) => ({
          contents: args.path === "tty"
            ? "module.exports = { isatty: function () { return false } }"
            : args.path === "os"
              ? "module.exports = { release: function () { return '' } }"
              : args.path === "adapter"
                ? "module.exports = function () { return '' }"
                : "module.exports = {}",
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
            .replace("while((result = ANSIRegex.exec(text))", "var result;\\n  while((result = ANSIRegex.exec(text))"),
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
    // Force the bundled library down its browser path while providing the
    // process fields Chalk/supports-color may inspect during initialization.
    js: 'var process = typeof process !== "undefined" ? process : { env: { TERM: "", TERM_PROGRAM: "", COLORTERM: "" }, platform: "browser", stdout: undefined, argv: [] };'
  },
})
