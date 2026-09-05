const ANSI = /\u001B\[[0-?]*[ -\/]*[@-~]/g

const codes: Record<string, string> = {
  reset: "0", bold: "1", dim: "2", italic: "3", underline: "4", inverse: "7", hidden: "8", strikethrough: "9",
  black: "30", red: "31", green: "32", yellow: "33", blue: "34", magenta: "35", cyan: "36", white: "37",
  gray: "90", grey: "90", bgBlack: "40", bgRed: "41", bgGreen: "42", bgYellow: "43", bgBlue: "44", bgMagenta: "45", bgCyan: "46", bgWhite: "47"
}

export const stripAnsi = (value: string): string => value.replace(ANSI, "")
export const displayWidth = (value: string, wcwidth: (s: string) => number): number =>
  Math.max(0, ...stripAnsi(value).split(/\r?\n/).map(wcwidth))

export const style = (value: string, ...styles: string[]): string => {
  const active = styles.map((s) => codes[s]).filter(Boolean)
  return active.length ? `\u001b[${active.join(";")}m${value}\u001b[0m` : value
}

export const styleEachChar = (value: string, ...styles: string[]): string =>
  [...stripAnsi(value)].map((char) => style(char, ...styles)).join("")

export const ansiSafeSlice = (value: string, width: number, wcwidth: (s: string) => number): string => {
  if (width <= 0) return ""
  let out = ""
  let visible = 0
  let i = 0
  while (i < value.length && visible < width) {
    ANSI.lastIndex = i
    const match = ANSI.exec(value)
    if (match?.index === i) {
      out += match[0]
      i += match[0].length
      continue
    }
    const cp = String.fromCodePoint(value.codePointAt(i)!)
    const w = wcwidth(cp)
    if (visible + w > width) break
    out += cp
    visible += w
    i += cp.length
  }
  return out
}
