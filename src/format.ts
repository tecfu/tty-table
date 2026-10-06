import smartwrap from "smartwrap"
import { displayWidth } from "./ansi"

const addPadding = (config: any, width: number) => {
  return width + config.paddingLeft + config.paddingRight
}

const getDisplayWidth = (value: any) => {
  return displayWidth(value.toString())
}

/**
 * Returns the widest cell give a collection of rows
 *
 * @param object columnOptions
 * @param array rows
 * @param integer columnIndex
 * @returns string
 */
const getMaxLength = (columnOptions: any, rows: any[], columnIndex: number) => {
  let widest = 0

  // Include the header value without allocating a copied rows array or a
  // synthetic header row for every column.
  if (columnOptions && (columnOptions.value || columnOptions.alias)) {
    const value = columnOptions.alias || columnOptions.value
    widest = getDisplayWidth(value)
  }

  for (const row of rows) {
    const cell = row[columnIndex]

    // A cell has to be *present*, not truthy: false, 0 and "" all render text, and
    // skipping them left the column one cell wide, so "false" came out stacked
    // vertically one character per line. Only undefined and null are excluded -
    // buildCell has already replaced them with defaultValue for the measurement run.
    if (typeof cell === "undefined" || cell === null) continue

    // check cell value is object or scalar
    const value = (typeof cell === "object" && typeof cell.value !== "undefined") ? cell.value : cell
    const width = getDisplayWidth(value)
    if (width > widest) widest = width
  }

  return widest
}

/**
 * Get total width available to this table instance
 *
 *
 */
const getAvailableWidth = (config: any) => {
  let viewport: number

  if (process && ((process.stdout && process.stdout.columns) || (process.env && process.env.COLUMNS))) {
    // forked calls that do not inherit process.stdout must use process.env
    const columns: any = (process.stdout && process.stdout.columns) ? process.stdout.columns : process.env.COLUMNS
    viewport = Number(columns) - config.marginLeft
  /* istanbul ignore next */
  } else if (typeof (globalThis as any).window !== "undefined") {
    // browser
    viewport = (globalThis as any).window.innerWidth
  } else {
    // process.stdout.columns does not exist. assume redirecting to write stream
    // use 80 columns, which is VT200 standard
    viewport = config.COLUMNS - config.marginLeft
  }

  // table width percentage of (viewport less margin)
  if (config.width !== "auto" && /^\d+%$/.test(config.width)) {
    return Math.min(1, (config.width.slice(0, -1) * 0.01)) * viewport
  }

  // table width fixed
  if (config.width !== "auto" && /^\d+$/.test(config.width)) {
    config.FIXED_WIDTH = true
    return config.width
  }

  // table width equals viewport less margin
  // @TODO deprecate and remove "auto", which was never documented so should not be
  // an issue
  return viewport
}

export const getStringLength = (str: string) => {
  // stripAnsi(string.replace(/[^\x00-\xff]/g,'XX')).length
  return displayWidth(str)
}

// ANSI characters that demarcate the start/end of a line. Hoisted out of
// wrapCellText, which runs once per cell and was recompiling them every time.
// eslint-disable-next-line no-control-regex
const startAnsiRegexp = /^(\x1b\[[0-9;]*m)+/
// eslint-disable-next-line no-control-regex
const endAnsiRegexp = /(\x1b\[[0-9;]*m)+$/

export const wrapCellText = (
  config: any,
  cellValue: any,
  columnIndex: number,
  cellOptions: any,
  rowType: string
) => {
  // coerce cell value to string
  let str = cellValue.toString()

  // store matching ANSI characters
  const startMatches = str.match(startAnsiRegexp) || [""]

  // remove ANSI start-of-line chars
  str = str.replace(startAnsiRegexp, "")

  // store matching ANSI characters so can be later re-attached
  const endMatches = str.match(endAnsiRegexp) || [""]

  // remove ANSI end-of-line chars
  str = str.replace(endAnsiRegexp, "")

  let alignTgt: string

  switch (rowType) {
    case ("header"):
      alignTgt = "headerAlign"
      break
    case ("body"):
      alignTgt = "align"
      break
    default:
      alignTgt = "footerAlign"
  }

  // equalize padding for centered lines
  if (cellOptions[alignTgt] === "center") {
    cellOptions.paddingLeft = cellOptions.paddingRight = Math.max(
      cellOptions.paddingRight,
      cellOptions.paddingLeft,
      0
    )
  }

  const columnWidth = config.table.columnWidths[columnIndex]

  // innerWidth is the width available for text within the cell
  const innerWidth = columnWidth
    - cellOptions.paddingLeft
    - cellOptions.paddingRight
    - config.GUTTER

  if (typeof config.truncate === "string") {
    str = truncate(str, cellOptions, innerWidth)
  } else {
    str = wrap(str, cellOptions, innerWidth)
  }

  // format each line
  const cell = str.split("\n").map((line: string) => {
    line = line.trim()

    const lineLength = getStringLength(line)

    // alignment
    if (lineLength < columnWidth) {
      let emptySpace = columnWidth - lineLength

      switch (true) {
        case (cellOptions[alignTgt] === "center"):
          emptySpace--
          const padBoth = Math.floor(emptySpace / 2)
          const padRemainder = emptySpace % 2
          line = " ".repeat(padBoth)
            + line
            + " ".repeat(padBoth + padRemainder)
          break

        case (cellOptions[alignTgt] === "right"):
          line = " ".repeat(emptySpace - cellOptions.paddingRight - 1)
            + line
            + " ".repeat(cellOptions.paddingRight)
          break

        default:
          line = " ".repeat(cellOptions.paddingLeft)
            + line
            + " ".repeat(emptySpace - cellOptions.paddingLeft - 1)
      }
    }

    // put ANSI color codes BACK on the beginning and end of string
    return startMatches[0] + line + endMatches[0]
  })

  return { cell, innerWidth }
}

export const truncate = (str: string, cellOptions: any, maxWidth: number) => {
  const stringWidth = displayWidth(str)

  if (maxWidth < stringWidth) {
    // @TODO give user option to decide if they want to break words on wrapping
    str = smartwrap(str, {
      width: maxWidth - displayWidth(cellOptions.truncate),
      breakword: true
    }).split("\n")[0]!
    str = str + cellOptions.truncate
  }

  return str
}

export const wrap = (str: string, cellOptions: any, innerWidth: number) => {
  const outstring = smartwrap(str, {
    errorChar: cellOptions.defaultErrorValue,
    minWidth: 1,
    trim: true,
    width: innerWidth
  })

  return outstring
}

export const getColumnWidths = (config: any, rows: any[]) => {
  const availableWidth = getAvailableWidth(config)

  // iterate over the header if we have it, iterate over the first row
  // if we do not (to step through the correct number of columns). Neither, for
  // Table([], []), means there are no columns to measure at all.
  const iterable: any[] = (config.table.header[0] && config.table.header[0].length > 0)
    ? config.table.header[0] : (rows[0] || [])

  let widths: number[] = iterable.map((column: any, columnIndex: number) => {
    let result: number

    switch (true) {
      // column width is a percentage of table width specified in column header
      case (typeof column === "object" && (/^\d+%$/.test(column.width))):
        result = (column.width.slice(0, -1) * 0.01) * availableWidth
        result = addPadding(config, result)
        break

      // column width is specified in column header
      case (typeof column === "object" && (/^\d+$/.test(column.width))):
        result = column.width
        break

      // 'auto' sets column width to its longest value in the initial data set
      default: {
        const columnOptions = (config.table.header[0][columnIndex])
          ? config.table.header[0][columnIndex] : {}
        const measurableRows = (rows.length) ? rows : config.table.header[0]

        result = getMaxLength(columnOptions, measurableRows, columnIndex)

        // add spaces for padding if not centered
        // @TODO test with if not centered conditional
        result = addPadding(config, result)
      }
    }

    // add space for gutter
    result = result + config.GUTTER
    return result
  })

  // calculate sum of all column widths (including marginLeft)
  const totalWidth = widths.reduce((prev: number, current: number) => prev + current, 0)

  // proportionately resize columns when necessary
  if (totalWidth > availableWidth || config.FIXED_WIDTH) {
    // proportion wont be exact fit, but this method keeps us safe
    const proportion = (availableWidth / totalWidth).toFixed(2) as unknown as number - 0.01
    const relativeWidths = widths.map((value: number) => Math.max(2, Math.floor(proportion * value)))
    if (config.FIXED_WIDTH) return relativeWidths

    // when proportion < 0 column cant be resized and totalWidth must overflow viewport
    if (proportion > 0) {
      const totalRelativeWidths = relativeWidths.reduce((prev: number, current: number) => prev + current)
      widths = (totalRelativeWidths < totalWidth) ? relativeWidths : widths
    }
  } else {
    widths = widths.map(Math.floor)
  }

  return widths
}
