import breakword from "breakword"

const ANSI = /\u001B\[[0-?]*[ -\/]*[@-~]/g

const codes: Record<string, string> = {
  reset: "0", bold: "1", dim: "2", italic: "3", underline: "4", inverse: "7", hidden: "8", strikethrough: "9",
  black: "30", red: "31", green: "32", yellow: "33", blue: "34", magenta: "35", cyan: "36", white: "37",
  gray: "90", grey: "90", bgBlack: "40", bgRed: "41", bgGreen: "42", bgYellow: "43", bgBlue: "44", bgMagenta: "45", bgCyan: "46", bgWhite: "47"
}

export const stripAnsi = (value: string): string => value.replace(ANSI, "")
const codePointWidth = (value: string): number =>
  [...value].reduce((total, char) => total + breakword.width(char), 0)

export const displayWidth = (value: string): number =>
  Math.max(0, ...stripAnsi(value).split(/\r?\n/).map(codePointWidth))

export const style = (value: string, ...styles: string[]): string => {
  const active = styles.map((s) => codes[s]).filter(Boolean)
  return active.length ? `\u001b[${active.join(";")}m${value}\u001b[0m` : value
}

export const styleEachChar = (value: string, ...styles: string[]): string =>
  [...stripAnsi(value)].map((char) => style(char, ...styles)).join("")

