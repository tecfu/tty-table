import { describe, expect, it } from "vitest"
import Table from "../src"

/**
 * Measured column widths were memoized on `global.columnWidths`, keyed by an
 * integer that counts tables inside one copy of the module. Two copies in one
 * process - a bundler that inlined tty-table next to a hoisted one, a monorepo with
 * two versions, a test runner that resets modules but not globals - restart the
 * counter at 1, so the second copy's tables render with the first copy's widths.
 */

// terminalAdapter lives in types.ts TableOptions but not in factory.ts Options; the
// two option types have drifted apart, so it goes in through a variable.
const streamOptions = { terminalAdapter: true }

const chunkWidths = (out: string) => new Set(out.split("\n").filter((line) => line.length).map((line) => line.length))

describe("column width memoization", () => {
  it("keeps the memo out of the process globals", () => {
    for (let i = 0; i < 25; i++) Table([[i, "value"], [i, "another value"]]).render()
    expect((globalThis as any).columnWidths).toBeUndefined()
  })

  it("does not let a streamed table inherit the geometry of the table before it", () => {
    const ordinary = Table([["a wide value in an ordinary table"]])
    expect(ordinary.render()).toContain("a wide value in an ordinary table")

    const stream = Table([["x"]], streamOptions)
    expect(stream.render()).toContain("│ x │")
  })

  it("renders tables of different widths independently", () => {
    const narrow = Table([{ value: "id" }], [[7]])
    const wide = Table([{ value: "description" }], [["a description long enough to matter"]])
    const narrowAgain = Table([{ value: "id" }], [[8]])
    expect(narrow.render()).toContain("│ id │")
    expect(wide.render()).toContain("a description long enough to matter")
    expect(narrowAgain.render()).toContain("│ id │")
  })

  it("keeps one geometry across the prints of a stream", () => {
    // the adapter path builds a new table per chunk and the first chunk of the
    // process fixes the geometry - that is the contract being checked here, so the
    // assertions compare the two chunks with each other rather than with a width
    const a = Table([{ value: "column one" }], [["a"]], streamOptions).render()
    const b = Table([{ value: "column one" }], [["b"]], streamOptions).render()
    expect(chunkWidths(a)).toEqual(chunkWidths(b))
    expect(chunkWidths(b).size).toBe(1)
  })

  it("invalidates auto-width measurements when the terminal is resized", () => {
    const original = process.stdout.columns
    try {
      process.stdout.columns = 30
      const table = Table([{ value: "description" }], [["a value that needs wrapping"]])
      const narrow = table.render()
      process.stdout.columns = 80
      const wide = table.render()
      expect(wide).not.toBe(narrow)
      expect(wide).toContain("a value that needs wrapping")
    } finally {
      process.stdout.columns = original
    }
  })

  it("re-renders the same table identically", () => {
    const table = Table([{ value: "h" }], [["value that sets the width"]])
    expect(table.render()).toBe(table.render())
  })
})
