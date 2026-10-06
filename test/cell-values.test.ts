import Table from "../src"

/**
 * Column width comes from measuring every cell. `getMaxLength` used to gate on the
 * cell being *truthy*, so `false`, `0` and `{ value: false }` were invisible to the
 * measurement while still rendering text - a column whose widest value was `false`
 * came out one character wide and printed "false" stacked vertically.
 */
describe("falsy cell values", () => {
  it("measures boolean cells, not just truthy ones", () => {
    const output = Table([{ value: "flag" }, { value: "b" }], [[false, "yes"], ["x", "y"]]).render()
    expect(output).toContain("│ false │ yes │")
    expect(output).not.toContain("fals │")
  })

  it("sizes a column of booleans by the word false", () => {
    const output = Table([{ value: "a" }], [[true], [false]]).render()
    expect(output).toContain("│ false │")
    expect(output).toContain("│ true  │")
  })

  it("measures an object cell holding a falsy value", () => {
    const output = Table([{ value: "a" }], [[{ value: false }], ["x"]]).render()
    expect(output).toContain("│ false │")
  })

  it("measures zero as one character", () => {
    const output = Table([{ value: "a" }], [[0], [1]]).render()
    expect(output).toContain("│ 0 │")
    expect(output).toContain("│ 1 │")
  })

  it("does not measure an empty string as anything", () => {
    const output = Table([{ value: "a" }], [[""], ["xx"]]).render()
    expect(output).toContain("│ xx │")
    expect(output).toContain("│    │")
  })

  it("still measures null and undefined as the empty default, not as the word null", () => {
    const output = Table([{ value: "a" }], [[null], [undefined], ["xx"]]).render()
    expect(output).not.toContain("nul")
    expect(output).not.toContain("undef")
    expect(output).toContain("│ xx │")
  })

  it("measures a custom defaultValue rather than the raw null", () => {
    const output = Table([{ value: "a" }], [[null], ["x"]], { defaultValue: "N/A" }).render()
    expect(output).toContain("│ N/A │")
  })
})
