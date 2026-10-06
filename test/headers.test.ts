import Table from "../src"

describe("header declarations", () => {
  it("renders a header row when columns are declared as plain strings", () => {
    const output = Table(["one", "two"], [[1, 2], [3, 4]]).render()
    expect(output).toContain("│ one │ two │")
  })

  it("sizes columns from string header text, not only from the body", () => {
    const output = Table(["Long Column Header", "x"], [[1, 2]]).render()
    expect(output).toContain("│ Long Column Header │ x │")
    expect(output).toContain("│         1          │ 2 │")
  })

  it("lays object rows out in header order", () => {
    // Without string header support the renderer fell back to Object.values, which
    // follows key insertion order and silently ignored the requested columns.
    const output = Table(["age", "name"], [{ name: "Ada", age: 37 }]).render()
    expect(output).toContain("│ age │ name │")
    expect(output).toContain("│ 37  │ Ada  │")
  })

  it("renders only the header columns that were asked for", () => {
    const output = Table(["name"], [{ name: "Ada", age: 37 }]).render()
    expect(output).toContain("Ada")
    expect(output).not.toContain("37")
  })

  it("still honours showHeader: false for string headers", () => {
    const output = Table(["one", "two"], [[1, 2]], { showHeader: false }).render()
    expect(output).not.toContain("one")
    expect(output).toContain("│  1  │  2  │")
  })

  it("does not change tables that already declare header objects", () => {
    expect(Table([{ value: "one" }, { value: "two" }], [[1, 2]]).render())
      .toBe(Table(["one", "two"], [[1, 2]]).render())
  })

  it("mixes string and object header entries", () => {
    const output = Table(["bee", { value: "ant", align: "left" }], [[1, 2]]).render()
    expect(output).toContain("│ bee │ ant │")
  })
})
