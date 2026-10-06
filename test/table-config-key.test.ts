import { describe, expect, it } from "vitest"
import Table from "../src"

/**
 * The factory kept each table's configuration under `Symbol.config`, which is not a
 * property of Symbol: it evaluates to undefined, and `object[undefined] = value`
 * writes the string key "undefined". The whole config therefore sat on the table as
 * an ordinary enumerable property.
 */
describe("where a table keeps its configuration", () => {
  it("does not publish the config as a property named undefined", () => {
    const table = Table([{ value: "h" }], [["v"]])
    expect(Object.prototype.hasOwnProperty.call(table, "undefined")).toBe(false)
    expect(Object.keys(table)).not.toContain("undefined")
    expect(Object.getOwnPropertyNames(table)).not.toContain("undefined")
  })

  it("serializes to something a caller can log", () => {
    const table = Table([{ value: "h" }], [["a value"]])
    expect(JSON.stringify(table).length).toBeLessThan(10)
    expect(() => JSON.stringify(table)).not.toThrow()
  })

  it("still renders, slices and prints after the config moved", () => {
    const table = Table([{ value: "h" }], [["a value"]])
    expect(table.render()).toContain("│ a value │")
    expect(table.slice(0)).toEqual([["a value"]])
    expect(table.length).toBe(1)
    expect(table.height).toBeGreaterThan(0)
  })

  it("keeps a spread of the table free of internals", () => {
    // a table is array-like (Object.create(body)), so spreading it is only useful
    // as a property dump - which is exactly what should not carry a config blob
    const table = Table([{ value: "h" }], [["a value"]])
    expect(Object.keys({ ...table })).toEqual(["renderTo", "render"])
    expect(JSON.stringify({ ...table })).toBe("{}")
  })

  it("lets many tables hold their own configuration", () => {
    const wide = Table([{ value: "wide column" }], [["a value long enough to matter"]])
    const narrow = Table([{ value: "id" }], [[1]])
    expect(narrow.render()).not.toBe(wide.render())
    expect(wide.render()).toContain("a value long enough to matter")
    expect(narrow.render()).toContain("│ 1  │")
  })
})
