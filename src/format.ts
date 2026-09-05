import wcwidth from "wcwidth"
import { ansiSafeSlice, displayWidth, stripAnsi } from "./ansi"
import type { ColumnOptions, RenderConfig } from "./types"

export const getStringLength = (value: string): number => displayWidth(value, wcwidth)

const pad = (value: string, width: number, align: "left" | "center" | "right"): string => {
  const missing = Math.max(0, width - getStringLength(value))
  if (align === "right") return " ".repeat(missing) + value
  if (align === "center") {
    const left = Math.floor(missing / 2)
    return " ".repeat(left) + value + " ".repeat(missing - left)
  }
  return value + " ".repeat(missing)
}

export const wrap = (value: string, width: number): string[] => {
  if (width <= 0) return [""]
  return value.split(/\r?\n/).flatMap((line) => {
    if (!line) return [""]
    const out: string[] = []
    let rest = line
    while (getStringLength(rest) > width) {
      let cut = ansiSafeSlice(rest, width, wcwidth)
      if (!cut) break
      const plain = stripAnsi(rest)
      const plainCut = stripAnsi(cut)
      const lastSpace = plainCut.lastIndexOf(" ")
      if (lastSpace > 0) {
        const target = plainCut.slice(0, lastSpace)
        cut = ansiSafeSlice(rest, getStringLength(target), wcwidth)
      }
      out.push(cut)
      rest = rest.slice(cut.length).replace(/^\s+/, "")
    }
    out.push(rest)
    return out
  })
}

export const truncate = (value: string, marker: string, width: number): string => {
  if (getStringLength(value) <= width) return value
  const available = Math.max(0, width - getStringLength(marker))
  return ansiSafeSlice(value, available, wcwidth) + marker
}

export const getMaxLength = (column: ColumnOptions, rows: unknown[][], index: number): number => {
  const values = rows.map((row) => row[index]).concat(column.value ?? column.alias ?? "")
  return Math.max(0, ...values.map((value) => getStringLength(String((value as { value?: unknown })?.value ?? value ?? ""))))
}

export const getAvailableWidth = (config: RenderConfig): number => {
  const viewport = Number(process.stdout?.columns || process.env.COLUMNS || config.COLUMNS) - config.marginLeft
  if (config.width === "auto") return viewport
  if (typeof config.width === "number") return Math.max(1, config.width)
  if (/^\d+%$/.test(config.width)) return Math.max(1, Math.floor(viewport * Number(config.width.slice(0, -1)) / 100))
  if (/^\d+$/.test(String(config.width))) return Number(config.width)
  return viewport
}

export const getColumnWidths = (config: RenderConfig, rows: unknown[][]): number[] => {
  const header = config.columnSettings
  const count = Math.max(header.length, ...rows.map((r) => r.length), 0)
  const available = getAvailableWidth(config)
  const raw = Array.from({ length: count }, (_, index) => {
    const col = header[index] ?? {}
    let width: number
    if (typeof col.width === "number") width = col.width
    else if (typeof col.width === "string" && /^\d+%$/.test(col.width)) width = available * Number(col.width.slice(0, -1)) / 100
    else if (typeof col.width === "string" && /^\d+$/.test(col.width)) width = Number(col.width)
    else width = getMaxLength(col, rows, index) + config.paddingLeft + config.paddingRight
    return Math.max(2, Math.floor(width) + config.GUTTER)
  })
  const total = raw.reduce((a, b) => a + b, 0)
  if (total <= available && !config.FIXED_WIDTH) return raw
  if (!total) return raw
  const scale = available / total
  return raw.map((w) => Math.max(2, Math.floor(w * scale)))
}

export const formatCell = (value: unknown, width: number, options: ColumnOptions, align: "left" | "center" | "right"): string[] => {
  const inner = Math.max(1, width - (options.paddingLeft ?? 1) - (options.paddingRight ?? 1) - 1)
  let text = String(value ?? "")
  if (typeof options.truncate === "string") text = truncate(text, options.truncate, inner)
  const lines = typeof options.truncate === "string" ? [text] : wrap(text, inner)
  return lines.map((line) => pad(" ".repeat(options.paddingLeft ?? 1) + line + " ".repeat(options.paddingRight ?? 1), width, align))
}
