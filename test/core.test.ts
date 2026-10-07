import Table from "../src"
import { displayWidth, stripAnsi } from "../src/ansi"

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
    expect(displayWidth(value)).toBe(4)
  })

  it("measures emoji and combining marks using breakword width semantics", () => {
    expect(displayWidth("😀a")).toBe(3)
    expect(displayWidth("e\u0301")).toBe(1)
  })

  it("measures the widest line of a multi-line value, not its total length", () => {
    expect(displayWidth("ab\n\u6f22\u5b57\u6f22\u5b57\ncd")).toBe(8)
    expect(displayWidth("\u001b[31mone\u001b[39m\ntwo")).toBe(3)
  })

  it("scores control characters by display width, not string length", () => {
    // \t and \r occupy no cells, so an ASCII fast path must not count them as 1
    expect(displayWidth("a\tb")).toBe(2)
    expect(displayWidth("ab\r")).toBe(2)
    expect(displayWidth("a\rb")).toBe(2)
  })

  it("measures a cell with more lines than Math.max can take as arguments", () => {
    const value = `${"x".repeat(5)}\n`.repeat(200000)
    expect(displayWidth(value)).toBe(5)
  })

  it("keeps a fixed table width when requested", () => {
    const output = Table([{ value: "name", width: 12 }], [["abcdefghijklm"]], { width: 16, truncate: "…" }).render()
    const lines = output.split("\n").filter(Boolean)
    expect(lines.every((line) => displayWidth(line) <= 18)).toBe(true)
  })

  it("supports formatter context without requiring this binding", () => {
    const formatter = ((value: unknown) => String(value).toUpperCase()) as any
    const table = Table([{ value: "name", formatter }], [["ada"]])
    expect(table.render()).toContain("ADA")
  })

  it("keeps formatter configure() scoped to the cell that called it", () => {
    // Cells share one merged option object per column, so a configure() call must
    // not become visible to the cells rendered after it.
    const formatter = function (this: any, value: unknown) {
      if (String(value) === "aa") this.configure({ align: "right" })
      return String(value)
    } as any
    const output = Table([{ value: "wide header", formatter }], [["aa"], ["bb"]]).render()
    const [first, second] = output.split("\n").filter((line) => /aa|bb/.test(line))
    expect(first!.indexOf("aa")).toBeGreaterThan(second!.indexOf("bb"))
  })
})


describe("stream output", () => {
  it("writes render output incrementally without changing render semantics", () => {
    const table = Table([{ value: "name" }], [["Ada"], ["Grace"]])
    const chunks: string[] = []
    table.renderTo({ write: (chunk: string) => chunks.push(chunk) })
    expect(chunks.length).toBeGreaterThan(1)
    expect(chunks.join("")).toBe(table.render())
    expect(table.height).toBeGreaterThan(0)
    expect(chunks.some((chunk) => chunk.includes("Ada"))).toBe(true)
    expect(chunks.some((chunk) => chunk.includes("Grace"))).toBe(true)
  })
})
