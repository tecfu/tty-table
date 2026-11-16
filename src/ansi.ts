import breakword from "breakword"

// eslint-disable-next-line no-control-regex -- matching the ESC CSI sequence is the point of this module
const ANSI = /\u001B\[[0-?]*[ -/]*[@-~]/g

const codes: Record<string, string> = {
  reset: "0", bold: "1", dim: "2", italic: "3", underline: "4", inverse: "7", hidden: "8", strikethrough: "9",
  black: "30", red: "31", green: "32", yellow: "33", blue: "34", magenta: "35", cyan: "36", white: "37",
  gray: "90", grey: "90", bgBlack: "40", bgRed: "41", bgGreen: "42", bgYellow: "43", bgBlue: "44", bgMagenta: "45", bgCyan: "46", bgWhite: "47"
}

export const stripAnsi = (value: string): string => value.replace(ANSI, "")

// Terminal width is a grapheme property: a ZWJ emoji sequence such as a
// family emoji occupies one displayed glyph, not the sum of its code points.
// Node 22 and modern browsers provide Intl.Segmenter; keep a code-point
// fallback for older browser runtimes using the standalone bundle.
// Constructed once, not per call: codePointWidth runs once per non-ASCII cell.
let graphemeSegmenter: { segment(input: string): Iterable<{ segment: string }> } | undefined
const getGraphemeSegmenter = () => {
  if (graphemeSegmenter === undefined) {
    const Segmenter = (globalThis as typeof globalThis & {
      Intl?: typeof Intl
    }).Intl?.Segmenter
    graphemeSegmenter = Segmenter
      ? new Segmenter(undefined, { granularity: "grapheme" })
      : undefined
  }
  return graphemeSegmenter
}

const codePointWidth = (value: string): number => {
  const segmenter = getGraphemeSegmenter()

  if (segmenter) {
    let total = 0
    for (const { segment } of segmenter.segment(value)) {
      const widths = [...segment].map((char) => breakword.width(char))
      // Terminal cell width is not identical to code-point count. ZWJ emoji
      // sequences, regional-indicator flags, keycap sequences, and any emoji
      // presented with U+FE0F each render as one two-cell glyph in
      // conventional terminals. Combining marks remain zero-width through
      // breakword's per-code-point measurement.
      const regionalIndicators = [...segment].filter((char) => {
        const codePoint = char.codePointAt(0) || 0
        return codePoint >= 0x1F1E6 && codePoint <= 0x1F1FF
      }).length
      const hasEmojiModifier = [...segment].some((char) => {
        const codePoint = char.codePointAt(0) || 0
        return codePoint >= 0x1F3FB && codePoint <= 0x1F3FF
      })
      if (segment.includes("\u200D") || regionalIndicators === 2 || hasEmojiModifier || segment.includes("\u20E3") || segment.includes("\uFE0F")) {
        total += 2
      } else {
        total += widths.reduce((sum: number, width: number) => sum + width, 0)
      }
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

// Preserve CSI sequences while working in the visible string's grapheme
// coordinates, including when a style change occurs inside a grapheme.
// eslint-disable-next-line no-control-regex -- matching ANSI CSI sequences
const ANSI_PART = /(\u001B\[[0-?]*[ -/]*[@-~])/g

/** Replace graphemes too wide for a one-cell column without splitting them. */
export const fitGraphemesToOneCell = (value: string, replacement: string): string => {
  const visible = stripAnsi(value)
  if (PRINTABLE_ASCII.test(visible)) return value

  const segmenter = getGraphemeSegmenter()
  // Without segmentation, a variation selector or ZWJ can make an otherwise
  // narrow code point occupy two cells. Replace non-ASCII conservatively when
  // such a sequence is present, but preserve ordinary one-cell characters.
  const uncertain = !segmenter && [...visible].some(char => {
    const code = char.codePointAt(0) || 0
    return code === 0xFE0F || code === 0x200D || code === 0x20E3
      || (code >= 0x1F1E6 && code <= 0x1F1FF) || (code >= 0x1F3FB && code <= 0x1F3FF)
  })
  const segments = segmenter ? segmenter.segment(visible) : Array.from(visible, segment => ({ segment }))
  const iterator = segments[Symbol.iterator]()
  let current = iterator.next()
  let end = 0
  let offset = 0
  let replace = false
  let inserted = false
  let output = ""

  for (const [index, part] of value.split(ANSI_PART).entries()) {
    if (index % 2 === 1) {
      output += part
      continue
    }
    for (const char of part) {
      if (offset >= end && !current.done) {
        end += current.value.segment.length
        replace = uncertain
          ? (current.value.segment.codePointAt(0) || 0) > 127
          : displayWidth(current.value.segment) > 1
        inserted = false
        current = iterator.next()
      }
      if (replace) {
        if (!inserted) output += replacement
        inserted = true
      } else output += char
      offset += char.length
    }
  }
  return output
}

/** Replace an unexpectedly over-wide wrapped line while retaining ANSI codes. */
export const replaceVisible = (value: string, replacement: string): string => {
  let inserted = false
  return value.split(ANSI_PART).map((part, index) => {
    if (index % 2 === 1 || !part) return part
    if (inserted) return ""
    inserted = true
    return replacement
  }).join("")
}

export const style = (value: string, ...styles: string[]): string => {
  const active = styles.map((s) => codes[s]).filter(Boolean)
  return active.length ? `\u001b[${active.join(";")}m${value}\u001b[0m` : value
}

export const styleEachChar = (value: string, ...styles: string[]): string =>
  [...stripAnsi(value)].map((char) => style(char, ...styles)).join("")

