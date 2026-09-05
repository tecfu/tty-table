import Table from "../src"
import { displayWidth, stripAnsi } from "../src/ansi"
import wcwidth from "wcwidth"

describe("typed table core", () => {
  it("renders the legacy array constructor", () => {
    const table = Table(["one", "two"], [[1, 2], [3, 4]])
    expect(table.render()).toContain("1")
    expect(table.render()).toContain("4")
  })

  it("supports object rows and named columns", () => {
    const table = Table([{ value: "name" }, { value: "age" }], [{ name: "Ada", age: 37 }])
    expect(table.render()).toContain("Ada")
    expect(table.render()).toContain("37")
  })

  it("measures ANSI and wide Unicode by display width", () => {
    const value = "\u001b[31m漢字\u001b[0m"
    expect(stripAnsi(value)).toBe("漢字")
    expect(displayWidth(value, wcwidth)).toBe(4)
  })

  it("keeps a fixed table width when requested", () => {
    const output = Table([{ value: "name", width: 12 }], [["abcdefghijklm"]], { width: 16, truncate: "…" }).render()
    const lines = output.split("\n").filter(Boolean)
    expect(lines.every((line) => displayWidth(line, wcwidth) <= 18)).toBe(true)
  })

  it("supports formatter context without requiring this binding", () => {
    const formatter = ((value: unknown) => String(value).toUpperCase()) as any
    const table = Table([{ value: "name", formatter }], [["ada"]])
    expect(table.render()).toContain("ADA")
  })
})
