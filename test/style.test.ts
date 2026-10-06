import chalk from "chalk"
import { colorizeCell, resetStyle, style } from "../src/style"
import { displayWidth } from "../src/ansi"

describe("chalk color compatibility", () => {
  const colors = [
    "black",
    "red",
    "green",
    "yellow",
    "blue",
    "magenta",
    "cyan",
    "white",
    "gray",
    "grey",
    "bgBlack",
    "bgRed",
    "bgGreen",
    "bgYellow",
    "bgBlue",
    "bgMagenta",
    "bgCyan",
    "bgWhite",
    "bold",
    "dim",
    "italic",
    "underline",
    "inverse",
    "hidden",
    "strikethrough"
  ]

  beforeAll(() => {
    chalk.level = 1
  })

  it("keeps all supported color/style names usable through the string API", () => {
    colors.forEach((color) => {
      expect(style("value", color)).not.toBe("value")
    })
  })

  it("keeps resetStyle tied to formatter configuration", () => {
    const options = { reset: false }
    const context = { configure: (value: { reset: boolean }) => Object.assign(options, value) }

    expect(resetStyle.call(context, "\u001b[31mvalue\u001b[39m")).toBe("value")
    expect(options.reset).toBe(true)
  })

  it("applies API color values through cell options", () => {
    expect(colorizeCell("value", { color: "red" }, "body")).toContain("\u001b[31m")
    expect(colorizeCell("value", { headerColor: "cyan" }, "header")).toContain("\u001b[36m")
    expect(colorizeCell("value", { footerColor: "yellow" }, "footer")).toContain("\u001b[33m")
  })
})


describe("grapheme display width", () => {
  it("measures ZWJ emoji sequences as one terminal glyph", () => {
    expect(displayWidth("👨‍👩‍👧‍👦")).toBe(2)
  })

  it("keeps combining marks attached to their base character", () => {
    expect(displayWidth("e\u0301")).toBe(1)
  })

  it("measures regional-indicator flags as two cells", () => {
    expect(displayWidth("🇺🇸")).toBe(2)
  })

  it("measures keycap sequences as two cells", () => {
    expect(displayWidth("1️⃣")).toBe(2)
  })

  it("measures emoji modifier sequences as two cells", () => {
    expect(displayWidth("👍🏽")).toBe(2)
  })
})
