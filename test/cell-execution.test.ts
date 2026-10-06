import Table from "../src"
import { displayWidth, stripAnsi } from "../src/ansi"


// Every line of a rendered table - border or content - is the same width in
// terminal display cells. A value measured at one length but printed at another
// is what breaks that invariant.
const rectangular = (out: string): boolean => {
  const lines = out.split("\n").filter((l) => l.trim() !== "")
  const widths = new Set(lines.map((l) => displayWidth(stripAnsi(l))))
  return widths.size === 1
}

describe("cell code runs once per render", () => {
  it("runs a column formatter once per body cell", () => {
    let calls = 0
    const table = Table([{ value: "a", formatter: (v: unknown) => { calls++; return String(v) } }, { value: "b", formatter: (v: unknown) => { calls++; return String(v) } }], [["1", "2"], ["3", "4"]])
    table.render()
    expect(calls).toBe(4) // two rows x two columns, not eight
  })

  it("runs a function cell once per body cell", () => {
    const seen: string[] = []
    const cell = (tag: string) => () => { seen.push(tag); return tag }
    const table = Table(["h"], [[cell("x")], [cell("y")]])
    table.render()
    expect(seen).toEqual(["x", "y"])
  })

  it("prints the same value it measured", () => {
    const produced: string[] = []
    let n = 0
    const table = Table([{ value: "h", formatter: () => { const s = "z".repeat(3 + n++); produced.push(s); return s } }], [["a"], ["b"]])
    const out = table.render()
    for (const p of produced) expect(out).toContain(p)
    expect(rectangular(out)).toBe(true)
  })

  it("repeated renders run cell code once per cell per render", () => {
    let calls = 0
    const table = Table([{ value: "h", formatter: (v: unknown) => { calls++; return String(v) } }], [["a"], ["b"]])
    table.render()
    const after1 = calls
    table.render()
    expect(after1).toBe(2)
    expect(calls - after1).toBe(2)
  })

  it("preserves configure() from the measuring pass", () => {
    // The cell asks for left alignment through this.configure(). Master ran the
    // cell twice, so the option arrived twice; with a single run the rendered
    // output has to stay identical - the replay is what keeps it that way.
    let calls = 0
    const table = Table([{ value: "header" }], [[function (this: any) { calls++; this.configure({ align: "left" }); return "body" }]])
    const out = table.render()
    expect(out).toContain("│ body   │")
    expect(calls).toBe(1)
  })

  it("runs a column formatter for the body cell only, never the header", () => {
    let calls = 0
    const table = Table([{ value: "h", formatter: (v: unknown) => { calls++; return String(v) } }], [["x"]])
    const out = table.render()
    // the header keeps its own text; the formatter ran for the body cell
    expect(out).toContain("│ h │")
    expect(calls).toBe(1)
  })

  it("treats null and undefined cells the same as before", () => {
    const table = Table(["a", "b"], [[null, 1], [2, undefined]])
    const out = table.render()
    expect(out).toContain("│   │ 1 │")
  })

  // The checklist a review asked for: the phases the memo moves user code into,
  // asserted cell-kind by cell-kind.

  it("runs a footer function cell once, exactly as before", () => {
    // Footers are never measured (the dry pass only walks body rows), so they
    // ran once even before this fix. This pins that down.
    let calls = 0
    const table = Table(["a"], [["x"]], [() => { calls++; return "F" }])
    const out = table.render()
    expect(out).toContain("F")
    expect(calls).toBe(1)
  })

  it("never runs a formatter attached to a footer cell, as before", () => {
    // buildCell gates formatter execution on rowType "body"; a formatter on a
    // footer cell object is dead weight in every version of the library.
    let calls = 0
    const table = Table(["a"], [["x"]], [{ value: "F", formatter: () => { calls++; return "G" } }])
    const out = table.render()
    expect(out).toContain("│ F │")
    expect(out).not.toContain("G")
    expect(calls).toBe(0)
  })

  it("replays configure() for several options at once", () => {
    let calls = 0
    const table = Table([{ value: "head" }], [[function (this: any) { calls++; this.configure({ paddingLeft: 3, paddingRight: 3, align: "center" }); return "mid" }]])
    const out = table.render()
    // padding 3+3 in a column widened only for "head": the value wraps one
    // character per line, on master (render-pass configure) and here (replayed
    // configure) alike - asserted to pin the replay down, not to endorse it
    expect(out).toContain("│  m   │")
    expect(rectangular(out)).toBe(true)
    expect(calls).toBe(1)
  })

  it("accumulates several configure() calls into the replay", () => {
    let calls = 0
    const table = Table([{ value: "head" }], [[function (this: any) { calls++; this.configure({ paddingLeft: 2 }); this.configure({ align: "left" }); return "ab" }]])
    const out = table.render()
    expect(out).toContain("│  ab  │")
    expect(rectangular(out)).toBe(true)
    expect(calls).toBe(1)
  })

  it("supports this.style/this.resetStyle from a formatter", () => {
    let calls = 0
    const table = Table([{ value: "h", formatter: function (this: any, v: unknown) { calls++; return this.resetStyle(this.style(String(v), "red")) } }], [["x"]])
    const out = table.render()
    expect(out).toContain("│ x │")
    expect(stripAnsi(out)).toBe(out) // resetStyle cancelled the color, as before
    expect(calls).toBe(1)
  })

  it("runs an object cell's own formatter once", () => {
    let calls = 0
    const table = Table(["a"], [[{ value: 7, formatter: (v: unknown) => { calls++; return String(v) + "!" } }]])
    const out = table.render()
    expect(out).toContain("7!")
    expect(calls).toBe(1) // two on master: dry pass and render pass
  })

  it("renders the value it measured when a formatter is not pure", () => {
    let n = 0
    const table = Table([{ value: "h", formatter: () => (++n % 2 ? "short" : "much-longer-value") }], [["z"]])
    const out = table.render()
    expect(out).toContain("short")
    expect(out).not.toContain("much-longer-value")
    expect(rectangular(out)).toBe(true) // master: 7-wide box, wrapped 17-char value
  })

  it("still throws when a formatter returns undefined", () => {
    // Unchanged from master: the renderer stringifies the cell value, and
    // undefined has no toString. The memo stores values as-is and does not
    // paper over this.
    const table = Table(["a"], [[{ value: 1, formatter: () => undefined }]])
    expect(() => table.render()).toThrow(/Cannot read properties of undefined \(reading 'toString'\)/)
  })
})
