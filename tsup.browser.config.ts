import { defineConfig } from "tsup"
import { resolve } from "node:path"
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
      // stub modules the browser never calls: yargs (smartwrap's CLI dep) and
      // chalk (unused: style.js falls back to kleur when process.stdout is
      // absent) — same trick as the legacy browserify build's --ignore flags
      name: "stub-browser-only-deps",
      setup(build) {
        const empty = resolve("src/shims/empty.js")
        const inspect = resolve("src/shims/inspect.js")
        build.onResolve({ filter: /^(chalk|yargs|util|os|fs|path|tty)$/ }, () => ({ path: empty }))
        build.onResolve({ filter: /^object-inspect$/ }, () => ({ path: inspect }))
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
    // minimal process shim: style.js branches on process.stdout and kleur reads
    // process.env — browserify provided this implicitly, esbuild needs it explicit
    js: "var process = typeof process !== 'undefined' ? process : { env: {} };"
  },
})
