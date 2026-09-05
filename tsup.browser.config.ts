import { defineConfig } from "tsup"

export default defineConfig({
  entry: { "tty-table": "src/browser.ts" },
  format: ["iife"],
  globalName: "TtyTable",
  target: "es2020",
  bundle: true,
  noExternal: ["wcwidth"],
  sourcemap: true,
  clean: false,
  outDir: "dist/browser"
})
