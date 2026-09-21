import chalk from "chalk"
import stripAnsi from "strip-ansi"

const colorLib = typeof process !== "undefined" && process.stdout
  ? chalk
  : new chalk.Instance({ level: 1 })

const colorize = (value: string, color: string): string => {
  const fn = (colorLib as unknown as Record<string, unknown>)[color]
  return typeof fn === "function" ? (fn as (value: string) => string)(value) : value
}

export const style = (str: string, ...colors: string[]): string =>
  colors.reduce(colorize, str)

export const styleEachChar = (str: string, ...colors: string[]): string => {
  const chars = [...stripAnsi(str)]

  return chars.reduce((result, char) => {
    return result + colors.reduce(colorize, char)
  }, "")
}

// Formatter callbacks use configure() to set per-cell options. resetStyle therefore
// needs the formatter's this binding to disable subsequent cell colorization.
export const resetStyle = function (this: any, str: string): string {
  this.configure({ reset: true })
  return stripAnsi(str)
}

export const colorizeCell = (str: string, cellOptions: any, rowType: string): string => {
  let color: string | false = false

  switch (true) {
    case rowType === "body":
      color = cellOptions.color || color
      break

    case rowType === "header":
      color = cellOptions.headerColor || color
      break

    default:
      color = cellOptions.footerColor || color
  }

  if (color) {
    str = style(str, color)
  }

  return str
}

export const isColorEnabled = (): boolean => colorLib.level > 0
