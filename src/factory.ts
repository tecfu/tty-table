import defaults from "./defaults"
import { stringifyData } from "./render"
import { resetStyle, style, styleEachChar } from "./style"
import type { Alignment, BorderCharacters, BorderStyle, ColumnOptions } from "./types"

// A documented literal, plus any string: the union still autocompletes the
// allowed values, but code that builds the value at runtime (a config file, a
// CLI flag) does not stop compiling. Unknown values are a runtime error, which
// is where they always were.
type AlignInput = Alignment | (string & {})

let counter = 0

// Where the table's own configuration is kept. This was `Symbol.config`, which is
// not a thing - it evaluates to undefined, so the key became the string
// "undefined" and the whole config sat on the table as an enumerable property:
// Object.keys(table) said ["undefined", "render"], JSON.stringify(table) dumped a
// kilobyte of internals, and anything that spreads or clones a table copies them.
const _configKey = Symbol("config")

/**
 * Copy rows into the table's own array.
 *
 * `body.push(...rows)` passes every row as a call argument, and V8 refuses more
 * than roughly 125k of them: a 200k-row dataset died with
 * `RangeError: Maximum call stack size exceeded` before a single cell was
 * rendered. A loop has no such limit.
 */
const appendRows = (target: any[], source: any[]) => {
  for (let i = 0; i < source.length; i++) target.push(source[i])
}

export interface Formatter {
  // rowIndex is null for header and footer rows, which buildCell passes through.
  (cellValue: any, columnIndex: number, rowIndex: number | null, rowData: any, inputData: any): any
}

// Every option the library reads, with the type it accepts at runtime. The
// trailing index signature stays: options are merged wholesale into the cell
// config, so a key not listed here is still passed through.
export interface Options {
  align?: AlignInput
  alignment?: AlignInput
  borderColor?: string | false | null
  borderCharacters?: Record<string, BorderCharacters[]>
  // the documented names plus the numeric aliases (0 solid, 1 dashed, 2 none)
  // that defaults.borderCharacters also keys; any string is still assignable so
  // a value coming from a variable does not become a type error
  borderStyle?: BorderStyle | (string & {})
  color?: string | false
  columnSettings?: ColumnOptions[]
  compact?: boolean
  COLUMNS?: number
  defaultErrorValue?: string
  defaultValue?: string
  errorOnNull?: boolean
  FIXED_WIDTH?: boolean
  footerAlign?: AlignInput
  footerColor?: string | false
  formatter?: Formatter
  GUTTER?: number
  headerAlign?: AlignInput
  headerAlignment?: AlignInput
  headerColor?: string | false
  marginLeft?: number
  marginTop?: number
  paddingBottom?: number
  paddingLeft?: number
  paddingRight?: number
  paddingTop?: number
  showHeader?: boolean | null
  table?: Record<string, unknown>
  terminalAdapter?: boolean
  truncate?: string | boolean
  width?: string | number
  [key: string]: unknown
}

export interface Table extends Array<any> {
  render(): string
  height?: number
  [key: string]: any
}

const Factory = function (paramsArr: any[]): any {
  let header: any = []
  const body: any[] = []
  let footer: any = []
  let options: any = {}

  // handle different parameter scenarios
  switch (true) {
    // header, rows, footer, and options
    case (paramsArr.length === 4):
      header = paramsArr[0]
      appendRows(body, paramsArr[1]) // creates new array to store our rows (body)
      footer = paramsArr[2]
      options = paramsArr[3]
      break

    // header, rows, footer
    case (paramsArr.length === 3 && paramsArr[2] instanceof Array):
      header = paramsArr[0]
      appendRows(body, paramsArr[1]) // creates new array to store our rows
      footer = paramsArr[2]
      break

    // header, rows, options
    case (paramsArr.length === 3 && typeof paramsArr[2] === "object"):
      header = paramsArr[0]
      appendRows(body, paramsArr[1]) // creates new array to store our rows
      options = paramsArr[2]
      break

    // header, rows            (rows, footer is not an option)
    case (paramsArr.length === 2 && paramsArr[1] instanceof Array):
      header = paramsArr[0]
      appendRows(body, paramsArr[1]) // creates new array to store our rows
      break

    // rows, options
    case (paramsArr.length === 2 && typeof paramsArr[1] === "object"):
      appendRows(body, paramsArr[0]) // creates new array to store our rows
      options = paramsArr[1]
      break

    // rows
    case (paramsArr.length === 1 && paramsArr[0] instanceof Array):
      appendRows(body, paramsArr[0])
      break

    // adapter called: i.e. `require('tty-table')('automattic-cli-table')`
    case (paramsArr.length === 1 && typeof paramsArr[0] === "string"): {
      // known adapters are mapped statically so bundlers leave them external;
      // a dynamic require(`../adapters/${name}`) fallback would make esbuild
      // eagerly bundle every adapters/* file (candidate scanning), which then
      // fails on their ../dist/index.js requires at build time
      /* eslint-disable @typescript-eslint/no-require-imports -- these must stay require() calls:
         as imports the bundler would eagerly pull the adapters in (see comment above) */
      const adapters: Record<string, () => any> = {
        "automattic-cli-table": () => require("../adapters/automattic-cli-table.js"),
        "default-adapter": () => require("../adapters/default-adapter.js"),
        "terminal-adapter": () => require("../adapters/terminal-adapter.js")
      }
      /* eslint-enable @typescript-eslint/no-require-imports */
      const load = adapters[paramsArr[0]]
      if (!load) throw new Error(`Unknown adapter: "${paramsArr[0]}". Available adapters: ${Object.keys(adapters).join(", ")}`)
      return load()
    }

    default:
      // A library must not decide how the host process ends. This used to be
      // `console.log("Error: Bad params...")` followed by `process.exit()`.
      throw new TypeError(
        "Bad params. Expected one of: Table(rows), Table(rows, options), Table(header, rows), " +
        "Table(header, rows, options), Table(header, rows, footer), Table(header, rows, footer, options). " +
        "See docs at github.com/tecfu/tty-table"
      )
  }

  // for "deep" copy, use JSON.parse
  const cloneddefaults = JSON.parse(JSON.stringify(defaults))
  const config: any = Object.assign({}, cloneddefaults, options)

  // The renderer indexes borderCharacters[borderStyle] blindly, so a name that is
  // not in the table failed as "Cannot read properties of undefined (reading '0')"
  // - or, with borderColor set, one line earlier in this function.
  if (!(config.borderStyle in config.borderCharacters)) {
    throw new Error(
      `Unknown borderStyle: ${JSON.stringify(config.borderStyle)}. Available styles: ` +
      `${Object.keys(config.borderCharacters).join(", ")}, or supply your own rows under tableOptions.borderCharacters.`
    )
  }

  // backfixes for shortened option names
  config.align = config.alignment || config.align
  config.headerAlign = config.headerAlignment || config.headerAlign

  // for truncate true is equivalent to empty string
  if (config.truncate === true) config.truncate = ""

  // if borderColor customized, color the border character set
  if (config.borderColor) {
    config.borderCharacters[config.borderStyle]
      = config.borderCharacters[config.borderStyle].map(function (obj: any) {
        Object.keys(obj).forEach(function (key) {
          obj[key] = style(obj[key], config.borderColor)
        })
        return obj
      })
  }

  // Columns can be declared with plain strings. Every consumer of a header entry
  // reads it as an option object (`.value` / `.alias`), so normalise here: a string
  // header used to render no header row at all, and object rows were laid out in
  // key insertion order instead of the declared column order.
  header = header.map((column: any) => (typeof column === "string") ? { value: column } : column)

  // save a copy for merging columnSettings into cell options
  config.columnSettings = header.slice(0)

  // header
  config.table.header = header

  // match header geometry with body array
  config.table.header = [config.table.header]

  // footer
  config.table.footer = footer

  // counting table enables fixed column widths for streams,
  // variable widths for multiple tables simulateously
  if (config.terminalAdapter !== true) {
    counter++ // fix columnwidths for streams
  }
  config.tableId = counter

  // create a new object with an Array prototype
  const tableObject: any = Object.create(body)

  // save configuration to new object
  tableObject[_configKey] = config

  /**
   * Add method to render table to a string
   * @returns {String}
   * @memberof Table
   * @example
   * ```js
   * let str = t1.render();
   * console.log(str); //outputs table
   * ```
  */
  tableObject.render = function (this: any) {
    const output = stringifyData(this[_configKey], this.slice(0)) // get string output
    tableObject.height = this[_configKey].height
    return output
  }

  return tableObject
}

// One column definition. value and alias are both optional because buildCell
// reads `cellOptions.alias || cellOptions.value`, so either one on its own names
// a column; the rest are the per-column overrides wrapCellText and buildCell
// merge over the table options.
export interface Header {
  alias?: string
  align?: AlignInput
  alignment?: AlignInput
  color?: string | false
  defaultValue?: string
  defaultErrorValue?: string
  errorOnNull?: boolean
  footerAlign?: AlignInput
  footerColor?: string | false
  formatter?: Formatter
  headerAlign?: AlignInput
  headerAlignment?: AlignInput
  headerColor?: string | false
  isNull?: boolean
  marginLeft?: number
  marginTop?: number
  paddingBottom?: number
  paddingLeft?: number
  paddingRight?: number
  paddingTop?: number
  reset?: boolean
  truncate?: string | boolean
  value?: string
  width?: string | number
}

interface TtyTableFactory {
  (headers: (string | Header | Formatter)[], body: unknown[], footers: (string | Header | Formatter)[], config?: Options): Table
  (header: (string | Header | Formatter)[], body: unknown[], config?: Options): Table
  (body: unknown[], config?: Options): Table
  resetStyle(str: string): string
  style(str: string, ...colors: string[]): string
}

const Table = function (...params: any[]) {
  return Factory(params)
} as unknown as TtyTableFactory

Table.resetStyle = resetStyle
Table.style = styleEachChar

export default Table
