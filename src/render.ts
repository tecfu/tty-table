import { defaults } from "./defaults"
import { getColumnWidths, formatCell } from "./format"
import { colorizeCell, resetStyle, style } from "./style"
import type { ColumnOptions, RenderConfig, TableOptions } from "./types"

let tableCounter = 0

const normalizeOptions = (options: TableOptions = {}, header: unknown[]): RenderConfig => {
  const merged = { ...defaults, ...options } as RenderConfig
  merged.align = options.alignment ?? options.align ?? defaults.align
  merged.headerAlign = options.headerAlignment ?? options.headerAlign ?? defaults.headerAlign
  merged.columnSettings = header.map((item) => typeof item === "object" && item !== null ? item as ColumnOptions : {})
  merged.borderStyle = options.borderStyle ?? defaults.borderStyle
  merged.tableId = ++tableCounter
  merged.truncate = options.truncate === true ? "" : options.truncate ?? false
  return merged
}

const valueFromCell = (cell: unknown): unknown => {
  if (cell && typeof cell === "object" && "value" in cell) return (cell as { value: unknown }).value
  return cell
}

const rowValues = (row: unknown, header: unknown[], adapter?: string): unknown[] => {
  if (Array.isArray(row)) return row
  if (!row || typeof row !== "object") return [row]
  const object = row as Record<string, unknown>
  if (adapter === "automattic") {
    const key = Object.keys(object)[0]
    const value = key ? object[key] : undefined
    return Array.isArray(value) ? [key, ...value] : [key, value]
  }
  if (header.length && header.every((h) => h && typeof h === "object" && "value" in (h as object))) return header.map((h) => object[(h as { value: string }).value])
  return Object.values(object)
}

const applyFormatter = (value: unknown, options: ColumnOptions, rowIndex: number, columnIndex: number, row: unknown[], input: unknown[]): unknown => {
  if (typeof options.formatter !== "function") return value
  const context = {
    value, columnIndex, rowIndex, row, input,
    configure: (next: Partial<ColumnOptions>) => Object.assign(options, next),
    style: (v: string, ...styles: string[]) => style(v, ...styles),
    resetStyle
  }
  return options.formatter.modern ? options.formatter.modern(context) : options.formatter.call(context, value, columnIndex, rowIndex, row, input)
}

export const renderTable = (header: unknown[], input: unknown[], footer: unknown[], options: TableOptions = {}): { output: string; height: number } => {
  const config = normalizeOptions(options, header)
  const rows = input.map((row) => rowValues(row, header, (options as TableOptions & { adapter?: string }).adapter))
  config.columnSettings = header.map((item) => typeof item === "object" && item !== null ? item as ColumnOptions : {})
  const widths = getColumnWidths(config, rows)
  const border = config.borderCharacters[String(config.borderStyle)] ?? config.borderCharacters.solid
  const margin = " ".repeat(config.marginLeft)
  const horizontal = (part: 0 | 1 | 2): string => {
    const b = border[part]
    return margin + b.l + widths.map((w) => b.h.repeat(Math.max(0, w - 1))).join(b.j) + b.r
  }

  const renderRow = (row: unknown[], type: "header" | "body" | "footer", rowIndex: number): string[] => {
    const cells = widths.map((width, i) => {
      const col = { ...(config.columnSettings[i] ?? {}) }
      const raw = type === "header" ? valueFromCell(header[i]) : valueFromCell(row[i])
      const value = type === "body" ? applyFormatter(raw ?? (config.errorOnNull ? config.defaultErrorValue : config.defaultValue), col, rowIndex, i, row, input) : raw ?? ""
      if (value == null) return formatCell(config.errorOnNull ? config.defaultErrorValue : config.defaultValue, width, col, type === "header" ? config.headerAlign : config.align)
      const colored = colorizeCell(value, { ...config, ...col }, type)
      return formatCell(colored, width, col, type === "header" ? (col.headerAlign ?? config.headerAlign) : type === "footer" ? config.footerAlign : (col.align ?? config.align))
    })
    const height = Math.max(1, ...cells.map((c) => c.length))
    return Array.from({ length: height }, (_, line) => margin + border[1].v + cells.map((c) => c[line] ?? " ".repeat(widths[cells.indexOf(c)])).join(border[1].v) + border[1].v)
  }

  const sections: string[][] = []
  const showHeader = config.showHeader !== false && (config.showHeader === true || header.some((h) => h && typeof h === "object" && ((h as ColumnOptions).value || (h as ColumnOptions).alias)))
  if (showHeader) sections.push(...renderRow(header, "header", 0))
  rows.forEach((row, i) => sections.push(...renderRow(row, "body", i)))
  if (footer.length) sections.push(...renderRow(footer, "footer", 0))

  const lines = [horizontal(0)]
  sections.forEach((line, index) => {
    lines.push(line)
    const last = index === sections.length - 1
    if (!last && !(config.compact && rows[index]?.length === 0)) lines.push(horizontal(1))
  })
  lines.push(horizontal(2))
  const output = "\n".repeat(config.marginTop) + lines.join("\n")
  config.height = output.split(/\r?\n/).length
  return { output, height: config.height }
}

export { normalizeOptions }
