import Table from "../src"

// The internal config hangs off the table object. On master that happens to land
// under the string key "undefined" (fixed separately); either way the column
// bookkeeping is reachable at table[<configKey>].table.
const internalTable = (table: any): any => {
  const sym = Object.getOwnPropertySymbols(table).find((s) => String(s).includes("config"))
  return (sym ? table[sym] : table["undefined"]).table
}

describe("rendering a table repeatedly does not grow its column bookkeeping", () => {
  it("keeps columns at one entry per header column across renders", () => {
    const table = Table([{ value: "a" }, { value: "b" }], [[1, 2]])
    for (let i = 0; i < 50; i++) table.render()
    expect(internalTable(table).columns).toHaveLength(2)
  })

  it("keeps columnInnerWidths at one entry per header column across renders", () => {
    const table = Table([{ value: "a" }, { value: "b" }], [[1, 2]])
    for (let i = 0; i < 50; i++) table.render()
    expect(internalTable(table).columnInnerWidths).toHaveLength(2)
    expect(internalTable(table).columnInnerWidths.every((w: number) => typeof w === "number")).toBe(true)
  })

  it("holds the header column options of the last render", () => {
    const table = Table([{ value: "name" }, { value: "age" }], [["Ada", 37]])
    table.render()
    expect(internalTable(table).columns.map((c: any) => c.value)).toEqual(["name", "age"])
  })

  it("leaves the bookkeeping empty when there is no header to build", () => {
    const table = Table([{ value: "a" }], [[1]], { showHeader: false } as any)
    table.render()
    table.render()
    expect(internalTable(table).columns).toHaveLength(0)
    expect(internalTable(table).columnInnerWidths).toHaveLength(0)
  })

  it("does not change what is rendered", () => {
    const table = Table([{ value: "a" }, { value: "b" }], [[1, 2], [3, 4]])
    const first = table.render()
    for (let i = 0; i < 20; i++) table.render()
    expect(table.render()).toBe(first)
  })
})
