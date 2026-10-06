import breakword from "breakword"

// eslint-disable-next-line no-control-regex -- matching the ESC CSI sequence is the point of this module
const ANSI = /\u001B\[[0-?]*[ -/]*[@-~]/g

const codes: Record<string, string> = {
  reset: "0", bold: "1", dim: "2", italic: "3", underline: "4", inverse: "7", hidden: "8", strikethrough: "9",
  black: "30", red: "31", green: "32", yellow: "33", blue: "34", magenta: "35", cyan: "36", white: "37",
  gray: "90", grey: "90", bgBlack: "40", bgRed: "41", bgGreen: "42", bgYellow: "43", bgBlue: "44", bgMagenta: "45", bgCyan: "46", bgWhite: "47"
}

export const stripAnsi = (value: string): string => value.replace(ANSI, "")
const codePointWidth = (value: string): number => {
  // Terminal width is a grapheme property: a ZWJ emoji sequence such as a
  // family emoji occupies one displayed glyph, not the sum of its code points.
  // Node 22 and modern browsers provide Intl.Segmenter; keep a code-point
  // fallback for older browser runtimes using the standalone bundle.
  const Segmenter = (globalThis as typeof globalThis & {
    Intl?: typeof Intl
  }).Intl?.Segmenter

  if (Segmenter) {
    const segmenter = new Segmenter(undefined, { granularity: "grapheme" })
    let total = 0
    for (const { segment } of segmenter.segment(value)) {
      const widths = [...segment].map((char) => breakword.width(char))
      // A ZWJ sequence is one terminal glyph even though it contains several
      // emoji code points. Other graphemes retain breakword's per-code-point
      // semantics, including combining marks and regional-indicator pairs.
      total += segment.includes("\u200D") ? Math.max(...widths, 0) : widths.reduce((sum: number, width: number) => sum + width, 0)
    }
    return total
  }

  return [...value].reduce((total, char) => total + breakword.width(char), 0)
}

// Every printable ASCII character occupies exactly one terminal cell, so its
// display width is its length. Anything outside this range - including control
// characters such as \t and \r, which breakword scores as 0 cells - has to go
// through the per-code-point measurement.
const PRINTABLE_ASCII = /^[\x20-\x7E]*$/

/**
 * Width of the widest line in `value`, in terminal display cells.
 *
 * ANSI escape sequences are ignored. The line loop replaces an earlier
 * `Math.max(0, ...widths)`, which exhausted the argument stack for cells with
 * more than ~125k lines.
 */
export const displayWidth = (value: string): number => {
  if (PRINTABLE_ASCII.test(value)) return value.length

  const stripped = stripAnsi(value)
  let widest = 0

  for (const line of stripped.split(/\r?\n/)) {
    const width = PRINTABLE_ASCII.test(line) ? line.length : codePointWidth(line)
    if (width > widest) widest = width
  }

  return widest
}

export const style = (value: string, ...styles: string[]): string => {
  const active = styles.map((s) => codes[s]).filter(Boolean)
  return active.length ? `\u001b[${active.join(";")}m${value}\u001b[0m` : value
}

export const styleEachChar = (value: string, ...styles: string[]): string =>
  [...stripAnsi(value)].map((char) => style(char, ...styles)).join("")

