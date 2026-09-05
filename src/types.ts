export type Scalar = string | number | boolean | bigint | null | undefined
export type CellValue = Scalar | object
export type Alignment = "left" | "center" | "right"
export type BorderStyle = "solid" | "dashed" | "none" | "invisible" | 0 | 1 | 2
export type Width = "auto" | "100%" | `${number}%` | `${number}` | number

export interface BorderCharacters {
  v: string; l: string; j: string; h: string; r: string
}

export interface ColumnOptions {
  value?: string
  alias?: string
  width?: Width
  align?: Alignment
  alignment?: Alignment
  headerAlign?: Alignment
  headerAlignment?: Alignment
  color?: string | false
  headerColor?: string | false
  footerColor?: string | false
  formatter?: Formatter
  paddingLeft?: number
  paddingRight?: number
  paddingTop?: number
  paddingBottom?: number
  truncate?: false | true | string
  defaultValue?: string
  defaultErrorValue?: string
  errorOnNull?: boolean
  reset?: boolean
}

export interface TableOptions extends ColumnOptions {
  borderCharacters?: Record<string, BorderCharacters[]>
  borderColor?: string | false
  borderStyle?: BorderStyle
  COLUMNS?: number
  compact?: boolean
  FIXED_WIDTH?: boolean
  GUTTER?: number
  marginLeft?: number
  marginTop?: number
  showHeader?: boolean | null
  footerAlign?: Alignment
  table?: Record<string, unknown>
  terminalAdapter?: boolean
  columnSettings?: ColumnOptions[]
}

export interface FormatterContext {
  value: unknown
  columnIndex: number
  rowIndex: number | null
  row: unknown[]
  input: unknown[]
  configure(options: Partial<ColumnOptions>): void
  style(value: string, ...styles: string[]): string
  resetStyle(value: string): string
}

export type Formatter = ((value: unknown, columnIndex: number, rowIndex: number | null, row: unknown[], input: unknown[]) => unknown) & {
  modern?: (context: FormatterContext) => unknown
}

export interface RenderConfig extends Required<Pick<TableOptions, "align" | "borderStyle" | "compact" | "COLUMNS" | "marginLeft" | "marginTop" | "paddingLeft" | "paddingRight" | "paddingTop" | "paddingBottom" | "GUTTER" | "width" | "defaultValue" | "defaultErrorValue" | "errorOnNull">> {
  headerAlign: Alignment
  footerAlign: Alignment
  color: string | false
  headerColor: string | false
  footerColor: string | false
  borderColor: string | false
  truncate: false | string
  showHeader: boolean | null
  FIXED_WIDTH: boolean
  borderCharacters: Record<string, BorderCharacters[]>
  columnSettings: ColumnOptions[]
  height: number
  tableId: number
}
