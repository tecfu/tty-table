import { readFileSync } from "node:fs"
import { runInNewContext } from "node:vm"

describe("browser bundle", () => {
  it("loads without Node globals and preserves Chalk styling", () => {
    const source = readFileSync(new URL("../dist/browser/tty-table.global.js", import.meta.url), "utf8")
    const context: any = { console: { log: () => {} } }

    runInNewContext(source, context)

    expect(typeof context.TtyTable).toBe("object")
    expect(typeof context.TtyTable.default).toBe("function")
    expect(context.TtyTable.default.style("value", "red")).toContain("[31m")
  })
})
