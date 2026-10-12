const stripAnsi = require("strip-ansi")
const smartwrap = require("smartwrap")
const wcwidth = require("wcwidth")

const addPadding = (config, width) => {
  return width + config.paddingLeft + config.paddingRight
}

// Every printable ASCII character occupies exactly one terminal cell, so its
// display width is its length. Anything outside this range - including control
// characters such as \t and \r, which wcwidth scores as 0 cells - has to go
// through the per-line measurement.
const PRINTABLE_ASCII = /^[\x20-\x7E]*$/

/**
 * Width of the widest line in `value`, in terminal display cells.
 *
 * ANSI escape sequences are ignored. The line loop replaces an earlier
 * `Math.max(...widths)`, which exhausted the argument stack for values with more
 * than ~125k lines.
 */
const displayWidth = value => {
  if (PRINTABLE_ASCII.test(value)) return value.length

  const stripped = stripAnsi(value)
  let widest = 0

  for (const line of stripped.split(/[\n\r]/)) {
    const width = PRINTABLE_ASCII.test(line) ? line.length : wcwidth(line)
    if (width > widest) widest = width
  }

  return widest
}

/**
 * Returns the widest cell give a collection of rows
 *
 * @param object columnOptions
 * @param array rows
 * @param integer columnIndex
 * @returns string
 */
const getMaxLength = (columnOptions, rows, columnIndex) => {
  let widest = 0

  // add header value, alias to calculate width when applicable
  if (columnOptions && (columnOptions.value || columnOptions.alias)) {
    widest = displayWidth((columnOptions.alias || columnOptions.value).toString())
  }

  for (let i = 0; i < rows.length; i++) {
    const cell = rows[i][columnIndex]

    // A cell has to be *present*, not truthy: false, 0 and "" all render text
    // (buildCell passes scalers through), so they must contribute their
    // measured width. Only undefined and null are excluded - they are replaced
    // with the placeholder during rendering, not before measurement.
    if (typeof cell === "undefined" || cell === null) continue

    // check cell value is object or scalar. Unwrap by presence, not truthiness: an
    // object holding false/0/"" renders its string form, so the column must not be
    // sized from the string "[object Object]".
    const isObject = (typeof cell === "object")
    const value = (isObject && typeof cell.value !== "undefined") ? cell.value : cell

    const width = displayWidth(value.toString())
    if (width > widest) widest = width
  }

  return widest
}

/**
 * Get total width available to this table instance
 *
 *
 */
const getAvailableWidth = config => {
  let viewport

  if (process && ((process.stdout && process.stdout.columns) || (process.env && process.env.COLUMNS))) {
    // forked calls that do not inherit process.stdout must use process.env
    const columns = (process.stdout && process.stdout.columns) ? process.stdout.columns : process.env.COLUMNS
    viewport = Number(columns) - config.marginLeft
  /* istanbul ignore next */
  } else if (typeof window !== "undefined") {
    // browser
    viewport = window.innerWidth
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

module.exports.getAvailableWidth = getAvailableWidth

module.exports.getStringLength = string => {
  return displayWidth(string)
}

// ANSI characters that demarcate the start/end of a line. Hoisted out of
// wrapCellText, which runs once per cell and was recompiling them every time.
const startAnsiRegexp = /^(\033\[[0-9;]*m)+/
const endAnsiRegexp = /(\033\[[0-9;]*m)+$/

module.exports.wrapCellText = (
  config,
  cellValue,
  columnIndex,
  cellOptions,
  rowType
) => {
  // coerce cell value to string
  let string = cellValue.toString()

  // store matching ANSI characters
  const startMatches = string.match(startAnsiRegexp) || [""]

  // remove ANSI start-of-line chars
  string = string.replace(startAnsiRegexp, "")

  // store matching ANSI characters so can be later re-attached
  const endMatches = string.match(endAnsiRegexp) || [""]

  // remove ANSI end-of-line chars
  string = string.replace(endAnsiRegexp, "")

  let alignTgt

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
    string = exports.truncate(string, cellOptions, innerWidth)
  } else {
    string = exports.wrap(string, cellOptions, innerWidth)
  }

  // format each line
  const cell = string.split("\n").map(line => {
    line = line.trim()

    const lineLength = exports.getStringLength(line)

    // alignment
    if (lineLength < columnWidth) {
      let emptySpace = columnWidth - lineLength

      switch (true) {
        case (cellOptions[alignTgt] === "center"):
          emptySpace--
          const padBoth = Math.floor(emptySpace / 2)
          const padRemainder = emptySpace % 2
          line = Array(padBoth + 1).join(" ")
            + line
            + Array(padBoth + 1 + padRemainder).join(" ")
          break

        case (cellOptions[alignTgt] === "right"):
          line = Array(emptySpace - cellOptions.paddingRight).join(" ")
            + line
            + Array(cellOptions.paddingRight + 1).join(" ")
          break

        default:
          line = Array(cellOptions.paddingLeft + 1).join(" ")
            + line
            + Array(emptySpace - cellOptions.paddingLeft).join(" ")
      }
    }

    // put ANSI color codes BACK on the beginning and end of string
    return startMatches[0] + line + endMatches[0]
  })

  return { cell, innerWidth }
}

module.exports.truncate = (string, cellOptions, maxWidth) => {
  const stringWidth = displayWidth(string)

  if (maxWidth >= stringWidth) return string

  // Nothing fits. Handing a zero or negative width to the wrapper below returned
  // *more* characters than were asked for, so the cell overflowed its own border
  // and the rest of the table came out crooked.
  if (maxWidth < 1) return ""

  let marker = cellOptions.truncate
  let markerWidth = displayWidth(marker)

  // A marker at least as wide as the cell left the content a non-positive width.
  // Trim the marker down and keep one cell for content.
  if (markerWidth >= maxWidth) {
    if (maxWidth < 2) {
      // a single cell cannot hold both content and a marker
      marker = ""
      markerWidth = 0
    } else {
      marker = smartwrap(marker, {
        width: maxWidth - 1,
        breakword: true,
        trim: false
      }).split("\n")[0]
      markerWidth = displayWidth(marker)
    }
  }

  // @TODO give user option to decide if they want to break words on wrapping
  string = smartwrap(string, {
    width: maxWidth - markerWidth,
    breakword: true
  }).split("\n")[0]

  return string + marker
}

module.exports.wrap = (string, cellOptions, innerWidth) => {
  const outstring = smartwrap(string, {
    errorChar: cellOptions.defaultErrorValue,
    minWidth: 1,
    trim: true,
    width: innerWidth
  })

  return outstring
}

module.exports.getColumnWidths = (config, rows) => {
  const availableWidth = getAvailableWidth(config)

  // iterate over the header if we have it, iterate over the first row
  // if we do not (to step through the correct number of columns)
  // Neither header nor rows, for Table([], []), means there are no columns to
  // measure at all.
  const iterable = (config.table.header[0] && config.table.header[0].length > 0)
    ? config.table.header[0] : (rows[0] || [])

  let widths = iterable.map((column, columnIndex) => {
    let result

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
      default:
        const columnOptions = (config.table.header[0][columnIndex])
          ? config.table.header[0][columnIndex] : {}
        const measurableRows = (rows.length) ? rows : config.table.header[0]

        result = getMaxLength(columnOptions, measurableRows, columnIndex)

        // add spaces for padding if not centered
        // @TODO test with if not centered conditional
        result = addPadding(config, result)
    }

    // add space for gutter
    result = result + config.GUTTER
    return result
  })

  // calculate sum of all column widths (including marginLeft)
  const totalWidth = widths.reduce((prev, current) => prev + current, 0)

  // proportionately resize columns when necessary
  if (totalWidth > availableWidth || config.FIXED_WIDTH) {
    // proportion wont be exact fit, but this method keeps us safe
    const proportion = (availableWidth / totalWidth).toFixed(2) - 0.01
    const relativeWidths = widths.map(value => Math.max(2, Math.floor(proportion * value)))
    if (config.FIXED_WIDTH) return relativeWidths

    // when proportion < 0 column cant be resized and totalWidth must overflow viewport
    if (proportion > 0) {
      const totalRelativeWidths = relativeWidths.reduce((prev, current) => prev + current)
      widths = (totalRelativeWidths < totalWidth) ? relativeWidths : widths
    }
  } else {
    widths = widths.map(Math.floor)
  }

  return widths
}
