import { renderTable } from "./render"
import { resetStyle, style, styleEachChar } from "./style"
import type { TableOptions } from "./types"

export type * from "./types"

let counter = 0

export class Table<T = unknown> extends Array<T> {
  readonly options: TableOptions
  readonly header: unknown[]
  readonly footer: unknown[]
  height = 0

  constructor(header: unknown[] = [], rows: T[] = [], footer: unknown[] = [], options: TableOptions = {}) {
    super(...rows)
    this.header = header
    this.footer = footer
    this.options = options
    counter++
  }

  render(): string {
    const result = renderTable(this.header, this.slice() as unknown[], this.footer, this.options)
    this.height = result.height
    return result.output
  }
}

export interface TableFactory {
  <T = unknown>(header: unknown[], rows: T[], footer?: unknown[] | TableOptions, options?: TableOptions): Table<T>
  <T = unknown>(rows: T[], options?: TableOptions): Table<T>
  style: typeof styleEachChar
  resetStyle: typeof resetStyle
  styleEachChar: typeof styleEachChar
}

const factory = function <T>(...args: unknown[]): Table<T> {
  let header: unknown[] = []
  let rows: T[] = []
  let footer: unknown[] = []
  let options: TableOptions = {}
  if (args.length === 1 && Array.isArray(args[0])) rows = args[0] as T[]
  else if (args.length === 2 && Array.isArray(args[0]) && Array.isArray(args[1])) { header = args[0] as unknown[]; rows = args[1] as T[] }
  else if (args.length === 2 && Array.isArray(args[0]) && args[1] && typeof args[1] === "object") { rows = args[0] as T[]; options = args[1] as TableOptions }
  else if (args.length >= 3) {
    header = (args[0] as unknown[]) ?? []
    rows = (args[1] as T[]) ?? []
    if (Array.isArray(args[2])) footer = args[2] as unknown[]
    else if (args[2] && typeof args[2] === "object") options = args[2] as TableOptions
    if (args[3] && typeof args[3] === "object") options = args[3] as TableOptions
  }
  return new Table(header, rows, footer, options)
} as TableFactory

factory.style = styleEachChar
factory.styleEachChar = styleEachChar
factory.resetStyle = resetStyle

export default factory
export { style, styleEachChar, resetStyle }
