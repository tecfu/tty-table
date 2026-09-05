import { stripAnsi, style as ansiStyle, styleEachChar } from "./ansi"
import type { ColumnOptions } from "./types"

export const style = (value: unknown, ...styles: string[]): string => ansiStyle(String(value), ...styles)
export { styleEachChar }
export const resetStyle = (value: string): string => stripAnsi(value)
export const colorizeCell = (value: unknown, options: ColumnOptions, rowType: "header" | "body" | "footer"): string => {
  const color = rowType === "header" ? options.headerColor : rowType === "footer" ? options.footerColor : options.color
  return color ? style(value, color) : String(value ?? "")
}
export const isColorEnabled = (): boolean => Boolean(process.stdout?.isTTY)
