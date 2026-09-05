import defaults from "./defaults"
import { stringifyData } from "./render"
import { resetStyle, style, styleEachChar } from "./style"

let counter = 0

export interface Formatter {
  (cellValue: any, columnIndex: number, rowIndex: number, rowData: any, inputData: any): string
}

export interface Header {
  alias?: string
  align?: string
  color?: string
  footerAlign?: string
  footerColor?: string
  formatter?: Formatter
  headerAlign?: string
  headerColor?: string
  marginLeft?: number
  marginTop?: number
  paddingBottom?: number
  paddingLeft?: number
  paddingRight?: number
  paddingTop?: number
  value: string
  width?: string | number
}

export interface Options {
  borderStyle?: string
  borderColor?: string
  color?: string
  compact?: boolean
  defaultErrorValue?: string
  defaultValue?: string
  errorOnNull?: boolean
  truncate?: string | boolean
  width?: string | number
  footerColor?: string
  [key: string]: unknown
}

export interface Table extends Array<any> {
  render(): string
  height?: number
  [key: string]: any
}

const Factory = function (paramsArr: any[]): any {
  const _configKey = (Symbol as any).config // legacy quirk: evaluates to undefined; kept for behavior parity
  let header: any = []
  const body: any[] = []
  let footer: any = []
  let options: any = {}

  // handle different parameter scenarios
  switch (true) {
    // header, rows, footer, and options
    case (paramsArr.length === 4):
      header = paramsArr[0]
      body.push(...paramsArr[1]) // creates new array to store our rows (body)
      footer = paramsArr[2]
      options = paramsArr[3]
      break

    // header, rows, footer
    case (paramsArr.length === 3 && paramsArr[2] instanceof Array):
      header = paramsArr[0]
      body.push(...paramsArr[1]) // creates new array to store our rows
      footer = paramsArr[2]
      break

    // header, rows, options
    case (paramsArr.length === 3 && typeof paramsArr[2] === "object"):
      header = paramsArr[0]
      body.push(...paramsArr[1]) // creates new array to store our rows
      options = paramsArr[2]
      break

    // header, rows            (rows, footer is not an option)
    case (paramsArr.length === 2 && paramsArr[1] instanceof Array):
      header = paramsArr[0]
      body.push(...paramsArr[1]) // creates new array to store our rows
      break

    // rows, options
    case (paramsArr.length === 2 && typeof paramsArr[1] === "object"):
      body.push(...paramsArr[0]) // creates new array to store our rows
      options = paramsArr[1]
      break

    // rows
    case (paramsArr.length === 1 && paramsArr[0] instanceof Array):
      body.push(...paramsArr[0])
      break

    // adapter called: i.e. `require('tty-table')('automattic-cli-table')`
    case (paramsArr.length === 1 && typeof paramsArr[0] === "string"): {
      // known adapters are mapped statically so bundlers leave them external;
      // a dynamic require(`../adapters/${name}`) fallback would make esbuild
      // eagerly bundle every adapters/* file (candidate scanning), which then
      // fails on their ../dist/index.js requires at build time
      const adapters: Record<string, () => any> = {
        "automattic-cli-table": () => require("../adapters/automattic-cli-table.js"),
        "default-adapter": () => require("../adapters/default-adapter.js"),
        "terminal-adapter": () => require("../adapters/terminal-adapter.js")
      }
      const load = adapters[paramsArr[0]]
      if (!load) throw new Error(`Unknown adapter: "${paramsArr[0]}". Available adapters: ${Object.keys(adapters).join(", ")}`)
      return load()
    }

    /* istanbul ignore next */
    default:
      console.log("Error: Bad params. \nSee docs at github.com/tecfu/tty-table")
      process.exit()
  }

  // for "deep" copy, use JSON.parse
  const cloneddefaults = JSON.parse(JSON.stringify(defaults))
  const config: any = Object.assign({}, cloneddefaults, options)

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
