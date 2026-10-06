import { spawnSync } from "node:child_process"
import { existsSync, writeFileSync } from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

// The `tty-table` bin is adapters/terminal-adapter.js: it reads stdin, parses it and
// hands rows to the renderer. Bad input used to reach the renderer and come back as
// a TypeError and a stack trace.

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const cli = path.join(root, "adapters", "terminal-adapter.js")

const run = (input: string, args: string[] = []) => {
  const result = spawnSync(process.execPath, [cli, ...args], { input, cwd: root, encoding: "utf8", timeout: 30000 })
  // strip the cursor hide/show the adapter prints for want of a tty
  // eslint-disable-next-line no-control-regex -- matching the ESC byte is the point
  return { output: (result.stdout + result.stderr).replace(/\u001b\[[0-9;?]*[A-Za-z]/g, ""), status: result.status }
}

describe("tty-table command line", () => {
  it("is testing the built package", () => {
    expect(existsSync(path.join(root, "dist", "index.js")), "dist/ is missing - run `npm run build` first").toBe(true)
  })

  it("explains empty input instead of crashing", () => {
    const { output, status } = run("")
    expect(status).toBe(1)
    expect(output).toContain("No input")
    expect(output).not.toContain("TypeError")
  })

  it("explains a JSON array that is not a list of rows", () => {
    const { output, status } = run("[1, 2]", ["--format", "json"])
    expect(status).toBe(1)
    expect(output).toContain("Input error")
    expect(output).toContain("Row 0 is `1`")
    expect(output).not.toContain("row.map is not a function")
  })

  it("explains JSON that is not an array at all", () => {
    const { output, status } = run("{\"a\": 1}", ["--format", "json"])
    expect(status).toBe(1)
    expect(output).toContain("Expected an array of rows")
  })

  it("reports a header file it cannot read", () => {
    const file = path.join(os.tmpdir(), "tty-table-bad-header.json")
    writeFileSync(file, "nope")
    const { output, status } = run("a,b\n", ["--header", file])
    expect(status).toBe(1)
    expect(output).toContain("Configuration error")
    expect(output).not.toContain("SyntaxError")
  })

  it("knows the --config spelling of the header flag", () => {
    const { output, status } = run("a,b\n", ["--config", path.join(os.tmpdir(), "definitely-missing-9f3a.json")])
    expect(status).toBe(1)
    expect(output).toContain("Cannot find config file at")
  })

  it("renders csv and json input as before", () => {
    const csv = run("a,b\nc,d\n")
    expect(csv.status).toBe(0)
    expect(csv.output).toContain("│ a │ b │")
    expect(csv.output).toContain("│ c │ d │")
    const json = run("[{\"a\": 1, \"b\": 2}]", ["--format", "json"])
    expect(json.status).toBe(0)
    expect(json.output).toContain("│ 1 │ 2 │")
  })
})
