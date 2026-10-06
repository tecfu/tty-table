import Table from "../src"

describe("large inputs", () => {
  it("constructs a table with more rows than a spread argument list can hold", () => {
    // The constructor used to do `body.push(...rows)`, passing every row as a call
    // argument. V8 refuses more than ~125k of them, so a 300k row dataset died with
    // `RangeError: Maximum call stack size exceeded` before a cell was rendered.
    const rows = Array.from({ length: 300_000 }, (_, i) => [i])
    const table = Table([{ value: "n" }], rows)
    expect(table.length).toBe(300_000)
  })

  it("renders a table with far more rows than columns", () => {
    const rows = Array.from({ length: 5_000 }, (_, i) => [i % 7])
    const lines = Table([{ value: "n" }], rows).render().split("\n")
    // one line per row plus the header line
    expect(lines.filter((line) => line.includes("│")).length).toBe(5_001)
  })

  it("pads rows that have fewer cells than the header", () => {
    // buildRow padded with Array.apply(null, new Array(n)), which has an argument
    // limit; fill() does not.
    const header = Array.from({ length: 500 }, (_, i) => `c${i}`)
    const lines = Table(header, [["a", "b"]]).render().split("\n")
    const top = lines.find((line) => line.includes("┌"))!
    expect(top.split("┬").length).toBe(500)
    // the two cells land in the first columns, the other 498 are padded empties
    expect(lines.some((line) => line.includes("a"))).toBe(true)
  })

  it("keeps row heights independent for cells with different line counts", () => {
    const content = Table([{ value: "a" }, { value: "b" }], [["x", "1\n2\n3"], ["y", "z"]])
      .render()
      .split("\n")
      .filter((line) => line.includes("│"))
    expect(content.length).toBe(5)
    expect(content[1]).toContain("1")
    expect(content[3]).toContain("3")
    expect(content[4]).toContain("y")
  })
})
