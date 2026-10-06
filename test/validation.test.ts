import { describe, expect, it } from "vitest"
import Table from "../src"

/**
 * Failure modes of the argument handling: an unrecognised call shape used to
 * `console.log` and then `process.exit()`, an unknown borderStyle crashed deep
 * inside the renderer, and a table with no columns crashed in width measurement.
 */
describe("input validation", () => {
  it("throws on a call shape it does not understand instead of exiting", () => {
    // no zero-arg overload exists, which is part of why the bad-params branch was
    // reachable at all - and on master it ended the host process, so this test
    // cannot be run there
    const callNoArgs = Table as unknown as (arg?: unknown) => unknown
    expect(() => callNoArgs()).toThrow(TypeError)
    expect(() => callNoArgs()).toThrow(/Table\(rows, options\)/)
    expect(() => callNoArgs({} as unknown[])).toThrow(TypeError)
    expect(() => (Table as unknown as (a: unknown, b: unknown) => unknown)(1, 2)).toThrow(/Bad params/)
  })

  it("names the problem for an unknown borderStyle", () => {
    expect(() => Table([[1]], { borderStyle: "north-south" })).toThrow(/Unknown borderStyle: "north-south"/)
    // the message has to list what is actually available, including numeric aliases
    expect(() => Table([[1]], { borderStyle: "north-south" })).toThrow(/solid/)
    expect(() => Table([[1]], { borderStyle: "north-south" })).toThrow(/dashed/)
  })

  it("reports an unknown style before the borderColor lookup touches it", () => {
    expect(() => Table([[1]], { borderStyle: "block" as any, borderColor: "red" })).toThrow(/Unknown borderStyle/)
  })

  it("renders a table with no columns rather than crashing", () => {
    expect(() => Table([], []).render()).not.toThrow()
    expect(Table([], []).render()).toContain("┌")
    expect(Table([], [], ["f1", "f2"]).render()).toContain("┌")
    expect(Table([]).render()).toContain("┌")
  })

  it("accepts every built in style and its numeric aliases", () => {
    // the numeric aliases are runtime only: Options.borderStyle is `string` here,
    // while types.ts BorderStyle allows 0 | 1 | 2
    for (const style of ["solid", "dashed", "none", "invisible", 0, 1, 2] as const) {
      expect(() => Table([["a"]], { borderStyle: style as unknown as string })).not.toThrow()
    }
    expect(Table([["a"]], { borderStyle: "dashed" }).render()).toContain("+")
    expect(Table([["a"]], { borderStyle: "solid" }).render()).toContain("┌")
  })

  it("accepts a custom style supplied through borderCharacters", () => {
    const borderCharacters = {
      mine: [
        { v: "|", l: "=", r: "=", j: "=", h: "=" },
        { v: "|", l: "+", r: "+", j: "+", h: "-" },
        { v: "|", l: "=", r: "=", j: "=", h: "=" }
      ]
    }
    expect(Table([["a"]], { borderStyle: "mine", borderCharacters }).render()).toContain("=====")
  })

  it("explains a borderStyle missing from a replaced borderCharacters table", () => {
    const borderCharacters = {
      mine: [
        { v: "|", l: "=", r: "=", j: "=", h: "=" },
        { v: "|", l: "+", r: "+", j: "+", h: "-" },
        { v: "|", l: "=", r: "=", j: "=", h: "=" }
      ]
    }
    // borderCharacters replaces the whole table, so the default "solid" is gone
    expect(() => Table([["a"]], { borderCharacters } as any)).toThrow(/Available styles: mine/)
  })

  it("is not disturbed by a custom style name alongside borderColor", () => {
    const borderCharacters = {
      mine: [
        { v: "|", l: "=", r: "=", j: "=", h: "=" },
        { v: "|", l: "+", r: "+", j: "+", h: "-" },
        { v: "|", l: "=", r: "=", j: "=", h: "=" }
      ]
    }
    expect(() => Table([["a"]], { borderStyle: "mine", borderCharacters, borderColor: "red" })).not.toThrow()
  })
})
