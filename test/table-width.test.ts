import { afterEach, describe, expect, it } from "vitest"
import Table from "../src"
import { allocateProportionalWidths, wrapCellText } from "../src/format"
import { displayWidth } from "../src/ansi"

/**
 * Without a TTY (piping to a file, a CI log, a forked child) the viewport falls back
 * to the 80 column VT200 standard. getAvailableWidth returned that fallback straight
 * away and never looked at `width`, so an explicit width was silently ignored - while
 * the same table rendered to a terminal honoured it.
 */
const widestLine = (output: string) => Math.max(...output.split("\n").map((line) => line.length))

const savedColumns = process.env.COLUMNS
const savedTerminal = process.stdout.columns

const withoutTty = (render: () => string) => {
  delete process.env.COLUMNS
  try {
    process.stdout.columns = undefined as unknown as number
  } catch {
    // a getter-only stdout (some CI harnesses): COLUMNS is already deleted above
  }
  try {
    return render()
  } finally {
    if (typeof savedColumns !== "undefined") process.env.COLUMNS = savedColumns
    try {
      process.stdout.columns = savedTerminal
    } catch {
      // ignore
    }
  }
}

const rows = [["some text that is long enough to need a decision about wrapping"]]

describe("width without a terminal", () => {
  it("allocates a constrained width exactly without decimal rounding loss", () => {
    const widths = allocateProportionalWidths([13, 17, 19], 30)
    expect(widths.reduce((sum, width) => sum + width, 0)).toBe(30)
    expect(widths.every((width) => width >= 2)).toBe(true)
  })

  afterEach(() => {
    if (typeof savedColumns !== "undefined") process.env.COLUMNS = savedColumns
  })

  it("honours a fixed width when nothing reports a column count", () => {
    const output = withoutTty(() => Table([{ value: "a" }], rows, { width: 20 }).render())
    expect(widestLine(output)).toBeLessThanOrEqual(22)
    expect(output).toContain("│  some text that  │")
    expect(output.split("\n").filter((line) => line.trim()).length).toBe(9)
  })

  it("honours a percentage width when nothing reports a column count", () => {
    const output = withoutTty(() => Table([{ value: "a" }], rows, { width: "50%" }).render())
    expect(widestLine(output)).toBeLessThanOrEqual(42)
  })

  it("respects the margin in the fallback viewport", () => {
    const output = withoutTty(() => Table([{ value: "a" }], rows, { marginLeft: 10 }).render())
    // 80 - 10 for content, plus the margin itself
    expect(widestLine(output)).toBeLessThanOrEqual(80)
    expect(output.split("\n")[2]).toMatch(/^ {10}/)
  })

  it("renders the same table for a reported terminal and a redirect", () => {
    const piped = withoutTty(() => Table([{ value: "a" }], rows, { width: 20 }).render())
    process.env.COLUMNS = "80"
    const onTerminal = Table([{ value: "a" }], rows, { width: 20 }).render()
    expect(piped).toBe(onTerminal)
  })

  it("leaves the 80 column default alone when no width is given", () => {
    const output = withoutTty(() => Table([{ value: "a" }], rows).render())
    expect(widestLine(output)).toBeLessThanOrEqual(80)
    expect(output).toContain("│ some text that is long enough to need a decision about wrapping │")
  })

  it("caps a percentage above 100", () => {
    const output = withoutTty(() => Table([{ value: "a" }], rows, { width: "150%" }).render())
    expect(output).toBe(withoutTty(() => Table([{ value: "a" }], rows, { width: "100%" }).render()))
  })
})

describe("columns squeezed by a long cell", () => {
  // One long value forces the proportional allocation to shrink the other
  // columns down to two cells, which leaves no room for the cell padding. The
  // left/right aligned padding count went negative, so render() threw
  // "RangeError: Invalid count value: -1".
  const header = ["expiresUTC", "expiresRel", "appid", "userid", "type", "value", "note"]
    .map((value) => ({ value }))
  const longRow = [{
    expiresUTC: "2030-01-01 00:00",
    expiresRel: "in 5 years",
    appid: "app",
    userid: "alice@example.com",
    type: "cookie",
    value: `Session=${"a".repeat(128)}`,
    note: ""
  }]

  afterEach(() => {
    if (typeof savedColumns !== "undefined") process.env.COLUMNS = savedColumns
    else delete process.env.COLUMNS
  })

  for (const align of ["left", "right", "center"] as const) {
    for (const truncate of [true, "…"] as const) {
      it(`retains squeezed ${align} aligned headers and cells with truncate ${truncate}`, () => {
        const headers = ["a", "b", "c", "d", "e", "f", "g"]
        const row = [["Alpha", "Bravo", "Charlie", "Delta", "Echo", "x".repeat(500), "Golf"]]
        const output = Table(headers, row, { align, headerAlign: align, truncate, width: 80 }).render()
        const lines = output.split("\n").filter((line) => line.trim())
        expect(output).toContain("│a│b│c│d│e│")
        expect(output).toContain("│A│B│C│D│E│")
        expect(output).toContain("│G│")
        expect(new Set(lines.map(displayWidth)).size).toBe(1)
      })
    }

    it(`renders ${align} aligned cells without throwing at 80 columns`, () => {
      process.env.COLUMNS = "80"
      const output = Table(header, longRow, { align, headerAlign: align }).render()
      const lines = output.split("\n").filter((line) => line.trim())
      expect(widestLine(output)).toBeLessThanOrEqual(80)
      // every row, including the squeezed cells, lines up with the borders
      expect(new Set(lines.map((line) => line.length)).size).toBe(1)
      expect(output).toContain("aaaa")
    })
  }
})

describe("padding budget for text", () => {
  for (const [align, expected] of [["left", " x"], ["right", "x "], ["center", "x "]] as const) {
    it(`keeps the ${align} alignment when padding must shrink`, () => {
      const config = { table: { columnWidths: [3] }, GUTTER: 1, truncate: "…" }
      const options = { align, paddingLeft: 2, paddingRight: 2, truncate: "…" }
      const { cell, innerWidth } = wrapCellText(config, "xyz", 0, options, "body")
      expect(innerWidth).toBe(1)
      expect(cell).toEqual([expected])
    })
  }

  it("uses a one-cell fallback for wide text and preserves ANSI styling", () => {
    const config = { table: { columnWidths: [2] }, GUTTER: 1, truncate: "…" }
    const options = { align: "left", paddingLeft: 1, paddingRight: 1, truncate: "…" }
    const wide = wrapCellText(config, "漢字", 0, options, "body")
    expect(wide.innerWidth).toBe(1)
    expect(wide.cell).toEqual(["�"])
    const styled = wrapCellText(config, "\u001b[31mxyz\u001b[0m", 0, options, "body")
    expect(styled.cell).toEqual(["\u001b[31mx\u001b[0m"])
    expect(displayWidth(styled.cell[0]!)).toBe(1)
  })

  it("does not reduce padding when there is already room for text", () => {
    const config = { table: { columnWidths: [8] }, GUTTER: 1, truncate: "…" }
    const options = { align: "left", paddingLeft: 2, paddingRight: 2, truncate: "…" }
    const { cell, innerWidth } = wrapCellText(config, "abcde", 0, options, "body")
    expect(innerWidth).toBe(3)
    expect(cell).toEqual(["  ab…  "])
  })
})
