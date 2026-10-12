/* globals describe, it */
// Regression coverage for the 4.x maintenance fixes backported from the 5/6/7
// line. The example golden files catch output drift; these pin the individual
// behaviours directly.
//
// These assertions are deliberately independent of the ambient terminal. When the
// suite runs on a TTY the library enables color (so the raw output carries ANSI
// sequences) and `process.stdout.columns` is a prototype getter that an ordinary
// assignment cannot clear. Every rendered string is stripped before comparison,
// widths are measured in display cells, and the column count is overridden through
// a property descriptor that is restored afterwards.
const chai = require("chai")
const expect = chai.expect
const path = require("path")
const stripAnsi = require("strip-ansi")
const { spawnSync } = require("child_process")
const Table = require("../src/factory.js")
const Format = require("../src/format.js")

const CLI = path.join(__dirname, "..", "adapters", "terminal-adapter.js")

const plain = output => stripAnsi(String(output))

// `process.stdout.columns` is a getter on a TTY, so assignment is a silent no-op.
// Shadow it with an own, configurable property and restore the original descriptor
// instead of trying to write the old value back.
const savedColumnsDescriptor = Object.getOwnPropertyDescriptor(process.stdout, "columns")
const setColumns = value => Object.defineProperty(process.stdout, "columns", {
  value,
  configurable: true,
  writable: true
})
const restoreColumns = () => {
  if (savedColumnsDescriptor) Object.defineProperty(process.stdout, "columns", savedColumnsDescriptor)
  else delete process.stdout.columns
}

const withColumns = (columns, fn) => {
  setColumns(columns)
  try {
    return fn()
  } finally {
    restoreColumns()
  }
}

const withoutTty = fn => {
  const savedEnv = process.env.COLUMNS
  delete process.env.COLUMNS
  setColumns(undefined)
  try {
    return fn()
  } finally {
    restoreColumns()
    if (typeof savedEnv !== "undefined") process.env.COLUMNS = savedEnv
  }
}

const lines = output => plain(output).split("\n").filter(line => line.length)
// terminal cells, not code units: CJK and emoji lines can look short but occupy
// two cells per glyph
const widths = output => new Set(lines(output).map(line => Format.getStringLength(line)))
const rectangular = output => widths(output).size === 1
const widestLine = output => Math.max.apply(null, lines(output).map(line => Format.getStringLength(line)))
const run = (input, args) => {
  const result = spawnSync(process.execPath, [CLI].concat(args || []), {
    input,
    cwd: path.join(__dirname, ".."),
    encoding: "utf8",
    timeout: 30000
  })
  return {
    output: (result.stdout + result.stderr).replace(/\u001b\[[0-9;?]*[A-Za-z]/g, ""),
    status: result.status
  }
}

describe("display width fast path", () => {
  it("measures printable ASCII by length and control characters by cells", () => {
    expect(Format.getStringLength("hello world")).to.equal(11)
    expect(Format.getStringLength("a\tb")).to.equal(2)
    expect(Format.getStringLength("ab\r")).to.equal(2)
  })

  it("measures the widest line, not the concatenation", () => {
    expect(Format.getStringLength("ab\n漢字漢字\ncd")).to.equal(8)
  })

  it("does not overflow the argument stack on a cell with very many lines", () => {
    const value = `${"x".repeat(5)}\n`.repeat(200000)
    expect(Format.getStringLength(value)).to.equal(5)
  })
})

describe("cell width measurement", () => {
  it("sizes an object cell holding a falsy value by its rendered string", () => {
    const output = withColumns(90, () => Table([{ value: "a" }], [[{ value: false }], ["xx"]]).render())
    expect(plain(output)).to.contain("│ false │")
  })

  it("renders scalar falsy cells by their string value, per the 4.2.x fix of #71", () => {
    const output = withColumns(90, () => Table([{ value: "a" }], [[false], ["xx"]]).render())
    expect(plain(output)).to.contain("│ false │")
    expect(plain(output)).to.match(/│\s+xx\s+│/)
  })
})

describe("string header columns", () => {
  it("renders a header row declared as plain strings", () => {
    const output = withColumns(90, () => Table(["one", "two"], [[1, 2], [3, 4]]).render())
    expect(plain(output)).to.contain("│ one │ two │")
  })

  it("lays object rows out in the declared header order", () => {
    const output = withColumns(90, () => Table(["age", "name"], [{ name: "Ada", age: 37 }]).render())
    expect(plain(output)).to.contain("│ age │ name │")
    expect(plain(output)).to.contain("│ 37  │ Ada  │")
  })

  it("renders the same as the equivalent object header", () => {
    const strings = withColumns(90, () => Table(["one", "two"], [[1, 2]]).render())
    const objects = withColumns(90, () => Table([{ value: "one" }, { value: "two" }], [[1, 2]]).render())
    expect(plain(strings)).to.equal(plain(objects))
  })
})

describe("large inputs", () => {
  it("constructs a table with more rows than a spread argument list can hold", () => {
    const rows = Array.from({ length: 200000 }, (_, i) => [i])
    const table = Table([{ value: "n" }], rows)
    expect(table.length).to.equal(200000)
  })

  it("renders a table with far more rows than columns", () => {
    const rows = Array.from({ length: 3000 }, (_, i) => [i % 7])
    const output = withColumns(90, () => Table([{ value: "n" }], rows).render())
    // one content line per row plus the header line
    expect(lines(output).filter(line => line.includes("│")).length).to.equal(3001)
  })
})

describe("truncate markers", () => {
  it("keeps the box rectangular when the marker is wider than the column", () => {
    const output = withColumns(90, () =>
      Table([{ value: "x", width: 6 }], [["0123456789abcdefghij"]], { truncate: "<<<<<<<" }).render())
    expect(rectangular(output)).to.equal(true)
    expect(plain(output)).to.contain("│01<<< │")
  })

  it("counts a wide character marker by cells", () => {
    const output = withColumns(90, () =>
      Table([{ value: "x", width: 8 }], [["0123456789abcdefghij"]], { truncate: "漢字漢" }).render())
    expect(rectangular(output)).to.equal(true)
    expect(plain(output)).to.contain("│ 01漢字 │")
  })

  it("leaves ordinary truncation unchanged", () => {
    const output = withColumns(90, () =>
      Table([{ value: "x", width: 6 }], [["0123456789"]], { truncate: "…" }).render())
    expect(plain(output)).to.contain("│ 012… │")
  })
})

describe("width without a terminal", () => {
  const rows = [["some text that is long enough to need a decision about wrapping"]]

  it("honours a fixed width when nothing reports a column count", () => {
    const output = withoutTty(() => Table([{ value: "a" }], rows, { width: 20 }).render())
    expect(widestLine(output)).to.be.at.most(22)
  })

  it("honours a percentage width when nothing reports a column count", () => {
    const output = withoutTty(() => Table([{ value: "a" }], rows, { width: "50%" }).render())
    expect(widestLine(output)).to.be.at.most(42)
  })

  it("leaves the 80 column default alone when no width is given", () => {
    const output = withoutTty(() => Table([{ value: "a" }], rows).render())
    expect(widestLine(output)).to.be.at.most(80)
  })
})

describe("input validation", () => {
  it("throws on an unrecognised call shape instead of exiting", () => {
    expect(() => Table()).to.throw(TypeError)
    expect(() => Table(1, 2)).to.throw(/Bad params/)
  })

  it("names an unknown borderStyle", () => {
    expect(() => Table([[1]], { borderStyle: "north-south" })).to.throw(/Unknown borderStyle: "north-south"/)
    expect(() => Table([[1]], { borderStyle: "north-south" })).to.throw(/solid/)
  })

  it("renders a table with no columns", () => {
    expect(() => Table([], []).render()).not.to.throw()
    expect(plain(withColumns(90, () => Table([], []).render()))).to.contain("┌")
  })
})

describe("column width memoization", () => {
  const freshTable = () => {
    delete require.cache[require.resolve("../src/factory.js")]
    delete require.cache[require.resolve("../src/render.js")]
    delete require.cache[require.resolve("../src/format.js")]
    return require("../src/factory.js")
  }

  it("keeps the memo out of the process globals", () => {
    withColumns(90, () => {
      for (let i = 0; i < 20; i++) Table([[i, "value"], [i, "another value"]]).render()
      expect(global.columnWidths).to.equal(undefined)
    })
  })

  it("does not let a streamed table inherit the geometry of the table before it", () => {
    const Fresh = withColumns(90, () => freshTable())
    Fresh([["a wide value in an ordinary table"]]).render()
    const streamOptions = { terminalAdapter: true }
    const stream = Fresh([["x"]], streamOptions)
    expect(plain(withColumns(90, () => stream.render()))).to.contain("│ x │")
  })

  it("invalidates a measurement when the terminal is resized", () => {
    const table = Table([{ value: "description" }], [["a value that needs wrapping across more than sixty columns"]])
    const wide = withColumns(60, () => table.render())
    const narrow = withColumns(30, () => table.render())
    expect(Format.getStringLength(lines(narrow)[1])).not.to.equal(Format.getStringLength(lines(wide)[1]))
  })
})

describe("shared cell option bases", () => {
  it("keeps configure() scoped to the cell that called it", () => {
    const formatter = function (value) {
      if (String(value) === "aa") this.configure({ align: "right" })
      return String(value)
    }
    const output = withColumns(90, () => Table([{ value: "wide header", formatter }], [["aa"], ["bb"]]).render())
    const [first, second] = lines(output).filter(line => /aa|bb/.test(line))
    expect(first.indexOf("aa")).to.be.greaterThan(second.indexOf("bb"))
  })
})

describe("tty-table command line", () => {
  it("explains a flat JSON array instead of crashing", () => {
    const result = run("[1, 2]", ["--format", "json"])
    expect(result.status).to.equal(1)
    expect(result.output).to.contain("Input error")
    expect(result.output).to.contain("Row 0 is `1`")
    expect(result.output).not.to.contain("TypeError")
  })

  it("explains JSON that is not an array at all", () => {
    const result = run("{\"a\": 1}", ["--format", "json"])
    expect(result.status).to.equal(1)
    expect(result.output).to.contain("Expected an array of rows")
  })

  it("knows the --config spelling of the header flag", () => {
    const result = run("a,b", ["--config", path.join(require("os").tmpdir(), "definitely-missing-9f3a.json")])
    expect(result.status).to.equal(1)
    expect(result.output).to.contain("Cannot find config file at")
  })

  it("renders valid csv as before", () => {
    const result = run("a,b\nc,d\n")
    expect(result.status).to.equal(0)
    expect(result.output).to.contain("│ a │ b │")
    expect(result.output).to.contain("│ c │ d │")
  })
})
