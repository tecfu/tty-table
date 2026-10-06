import { afterEach, describe, expect, it } from "vitest"
import Table from "../src"

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
    const output = withoutTty(() => Table(
      [{ value: "a" }, { value: "b" }, { value: "c" }],
      [["a long value", "another long value", "third long value"]],
      { width: 20 }
    ).render())
    const border = output.split("\n")[0]!
    expect(border.length).toBe(20)
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
