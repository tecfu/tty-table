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
})
