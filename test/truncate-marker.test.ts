import { describe, expect, it } from "vitest"
import Table from "../src"

/**
 * `truncate` as a string replaces the tail of an over-long cell. The wrapper was
 * handed `columnWidth - markerWidth` without checking that the marker is not the
 * wider of the two, so a wide marker (or a narrow column) asked breakword for a
 * zero or negative width, got *more* characters back than were requested, and the
 * cell spilled past its own border: the rest of the table stops lining up.
 */
// Terminal cells, not code points: a CJK ideograph and an emoji take two each,
// so a line that looks short can still be too wide for its box.
const WIDE = /[\u1100-\u115F\u2E80-\u303E\u3041-\u33FF\u3400-\u4DBF\u4E00-\u9FFF\uA000-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE6F\uFF00-\uFF60\uFFE0-\uFFE6\u{1F300}-\u{1FAFF}]/u
const cells = (line: string) =>
  [...line.replace(/\u001b\[[0-9;]*m/g, "")].reduce((total, char) => total + (WIDE.test(char) ? 2 : 1), 0)

const rectangular = (output: string) => new Set(output.split("\n").filter((line) => line.length).map(cells)).size === 1

describe("truncate markers that do not fit", () => {
  it("keeps the box intact when the marker is wider than the column", () => {
    const output = Table([{ value: "x", width: 6 }], [["0123456789abcdefghij"]], { truncate: "<<<<<<<" }).render()
    expect(rectangular(output)).toBe(true)
    expect(output).toContain("│01<<< ")
  })

  it("gives the content the only cell when a two cell column cannot hold the marker", () => {
    const output = Table([{ value: "x", width: 4 }], [["0123456789"]], { truncate: "..." }).render()
    expect(rectangular(output)).toBe(true)
    expect(output).toContain("│01..")
  })

  it("counts a wide character marker by its cells, not its code points", () => {
    const output = Table([{ value: "x", width: 8 }], [["0123456789abcdefghij"]], { truncate: "漢字漢" }).render()
    expect(rectangular(output)).toBe(true)
    expect(output).toContain("│ 01漢字 │")
  })

  it("counts an emoji marker by its cells", () => {
    const output = Table([{ value: "x", width: 8 }], [["0123456789abcdefghij"]], { truncate: "😀😀😀" }).render()
    expect(rectangular(output)).toBe(true)
  })

  it("leaves ordinary truncation alone", () => {
    expect(Table([{ value: "x", width: 6 }], [["0123456789"]], { truncate: "…" }).render()).toContain("│ 012… │")
    expect(Table([{ value: "x", width: 6 }], [["0123456789"]], { truncate: true }).render()).toContain("│ 0123 │")
    expect(Table([{ value: "x", width: 6 }], [["0123456789"]], { truncate: "" }).render()).toContain("│ 0123 │")
  })

  it("does not touch a value that already fits", () => {
    const output = Table([{ value: "x", width: 20 }], [["ab"]], { truncate: "......" }).render()
    expect(output).toContain("│         ab         │")
    expect(rectangular(output)).toBe(true)
  })
})
