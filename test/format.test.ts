import { truncate, wrap } from "../src/format"
import { displayWidth } from "../src/ansi"

describe("smartwrap v4 integration", () => {
  it("wraps text at the requested cell width", () => {
    expect(wrap("break at word", {}, 10)).toBe("break at\nword")
  })

  it("breaks long words when truncating to the requested width", () => {
    expect(truncate("abcdefghijk", { truncate: "…" }, 10)).toBe("abcdefghi…")
  })

  it("does not truncate text that already fits", () => {
    expect(truncate("abcdef", { truncate: "…" }, 10)).toBe("abcdef")
  })

  it("budgets multi-cell truncate strings by display width", () => {
    expect(displayWidth(truncate("abcdefghijk", { truncate: "⚡" }, 10))).toBe(10)
  })
})

describe("breakword width vs legacy wcwidth disagreements", () => {
  // smartwrap v4 / breakword measure some symbols as 2 cells that wcwidth 1.x scored as 1.
  it("scores emoji-presentation symbols at 2 cells", () => {
    expect(displayWidth("⚡")).toBe(2) // U+26A1 HIGH VOLTAGE SIGN
    expect(displayWidth("⭐")).toBe(2) // U+2B50 WHITE MEDIUM STAR
    expect(displayWidth("✅")).toBe(2) // U+2705 WHITE HEAVY CHECK MARK
  })

  it("still scores typical symbols that remain 1 cell", () => {
    expect(displayWidth("⚠")).toBe(1) // U+26A0 WARNING SIGN (not Emoji_Presentation by default)
    expect(displayWidth("★")).toBe(1) // U+2605 BLACK STAR
    expect(displayWidth("✔")).toBe(1) // U+2714 HEAVY CHECK MARK
  })

  it("wraps a line containing a 2-cell symbol within the target width", () => {
    // "ab⚡cd" = 1+1+2+1+1 = 6 cells; width 4 should break after the symbol budget is spent
    const out = wrap("ab⚡cd", {}, 4)
    const lines = out.split("\n")
    expect(lines.every((line) => displayWidth(line) <= 4)).toBe(true)
    expect(out).toContain("⚡")
  })
})
