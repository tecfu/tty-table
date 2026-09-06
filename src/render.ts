import { colorizeCell, isColorEnabled, style, resetStyle } from "./style"
import { wrapCellText, getColumnWidths } from "./format"
import stripAnsi from "strip-ansi"

/**
 * Converts arrays of data into arrays of cell strings
 * @param {TtyTable.Config} config
 * @param {Array<Array<string>|object|TtyTable.Formatter>} inputData
 * @returns {Array<string>}
 */
export const stringifyData = (config: any, inputData: any[]) => {
  const sections: any = {
    header: [],
    body: [],
    footer: []
  }
  const marginLeft = " ".repeat(config.marginLeft)
  const borderStyle = config.borderCharacters[config.borderStyle]
  const borders: string[] = []

  // support backwards compatibility cli-table's multiple constructor geometries
  // @TODO deprecate and support only a single format
  const constructorType = getConstructorGeometry(inputData[0] || [], config)
  const rows = coerceConstructorGeometry(config, inputData, constructorType)

  // when streaming values to tty-table, we don't want column widths to change
  // from one rows set to the next, so we save the first set of widths and reuse
  if (!(global as any).columnWidths) {
    (global as any).columnWidths = {}
  }

  if ((global as any).columnWidths[config.tableId]) {
    config.table.columnWidths = (global as any).columnWidths[config.tableId]
  } else {
    const formattedRows = rows.map((row: any[], rowIndex: number) => {
      return row.map((cell: any, cellIndex: number) => {
        return buildCell(config, cell, cellIndex, "body", rowIndex, rows, inputData, true)
      })
    })
    ;(global as any).columnWidths[config.tableId] = config.table.columnWidths = getColumnWidths(config, formattedRows)
  }

  // stringify header cells
  // hide header if no column names or if specified in config
  switch (true) {
    case (config.showHeader !== null && !config.showHeader): // explicitly false, hide
      sections.header = []
      break

    case (config.showHeader === true): // explicitly true, show
    case (!!config.table.header[0].find((obj: any) => obj.value || obj.alias)): //  atleast one named column, show header
      sections.header = config.table.header.map((row: any[]) => {
        return buildRow(config, row, "header", null, rows, inputData)
      })
      break

    default: // no named columns, hide
      sections.header = []
  }

  // stringify body cells
  sections.body = rows.map((row: any[], rowIndex: number) => {
    return buildRow(config, row, "body", rowIndex, rows, inputData)
  })

  // stringify footer cells
  sections.footer = (config.table.footer instanceof Array && config.table.footer.length > 0) ? [config.table.footer] : []

  sections.footer = sections.footer.map((row: any[]) => {
    return buildRow(config, row, "footer", null, rows, inputData)
  })

  // apply borders
  // 0=top, 1=middle, 2=bottom
  for (let a = 0; a < 3; a++) {
    // add left border
    borders[a] = borderStyle[a].l

    // add joined borders for each column
    config.table.columnWidths.forEach((columnWidth: number, index: number, arr: number[]) => {
      // Math.max because otherwise columns 1 wide wont have horizontal border
      borders[a] += " ".repeat(Math.max(columnWidth - 1, 0))
      borders[a] += ((index + 1 < arr.length) ? borderStyle[a].j : "")
    })

    // add right border
    borders[a] += borderStyle[a].r

    // no trailing space on footer
    borders[a] = (a < 2) ? `${marginLeft + borders[a]}\n` : marginLeft + borders[a]
  }

  // Build output as chunks instead of repeatedly concatenating the complete
  // output string. Repeated string concatenation makes large tables needlessly
  // expensive because each append may copy the accumulated output.
  const output: string[] = [borders[0]]

  // for each section (header,body,footer)
  for (const [sectionIndex, sectionName] of Object.keys(sections).entries()) {
    const section = sections[sectionName]

    // for each row in the section. Use an index instead of shift(), which
    // requires moving the remaining array elements on every iteration.
    for (let rowIndex = 0; rowIndex < section.length; rowIndex++) {
      const row = section[rowIndex]

      // if(row.length === 0) {break}

      row.forEach((line: string[]) => {
        // vertical row borders
        output.push(
          marginLeft
          // left vertical border
          + borderStyle[1].v
          // join cells on vertical border
          + line.join(borderStyle[1].v)
          // right vertical border
          + borderStyle[1].v
          // end of line
          + "\n"
        )
      })

      // bottom horizontal row border
      switch (true) {
      // skip if end of body and no footer
        case (rowIndex === section.length - 1
             && sectionIndex === 1
             && sections.footer.length === 0):
          break

        // skip if end of footer
        case (rowIndex === section.length - 1
             && sectionIndex === 2):
          break

        // skip if compact
        case (config.compact && sectionName === "body" && !row.empty):
          break

        // skip if border style is "none"
        case (config.borderStyle === "none" && config.compact):
          break

        default:
          output.push(borders[1])
      }
    }
  }

  // bottom horizontal border
  output.push(borders[2])

  const finalOutput = "\n".repeat(config.marginTop) + output.join("")

  // record the height of the output
  config.height = finalOutput.split(/\r\n|\r|\n/).length

  return finalOutput
}

export const buildRow = (config: any, row: any[], rowType: string, rowIndex: number | null, rowData: any[], inputData: any[]) => {
  let minRowHeight = 0

  // tag row as empty if empty, used for `compact` option
  if (row.length === 0 && config.compact) {
    (row as any).empty = true
    return row
  }

  // force row to have correct number of columns
  const lengthDifference = config.table.columnWidths.length - row.length
  if (lengthDifference > 0) {
    // array (row) lacks elements, add until equal
    row = row.concat(Array.apply(null, new Array(lengthDifference)).map(() => null))
  } else if (lengthDifference < 0) {
    // array (row) has too many elements, remove until equal
    row.length = config.table.columnWidths.length
  }

  // convert each element in row to cell format
  row = row.map((elem: any, elemIndex: number) => {
    const cell = buildCell(config, elem, elemIndex, rowType, rowIndex, rowData, inputData)
    minRowHeight = (minRowHeight < cell.length) ? cell.length : minRowHeight
    return cell
  })

  // apply top and bottom padding to row
  minRowHeight = (rowType === "header") ? minRowHeight
    : minRowHeight + (config.paddingBottom + config.paddingTop)

  const linedRow: any[] = Array.apply(null, { length: minRowHeight } as any)
    .map(Function.call, () => [])

  row.forEach(function (cell: string[], a: number) {
    const whitespace = " ".repeat(Math.max(config.table.columnWidths[a] - 1, 0))

    if (rowType === "body") {
      // add whitespace for top padding
      for (let i = 0; i < config.paddingTop; i++) {
        cell.unshift(whitespace)
      }

      // add whitespace for bottom padding
      for (let i = 0; i < config.paddingBottom; i++) {
        cell.push(whitespace)
      }
    }

    // a `row` is divided by columns (horizontally)
    // a `linedRow` becomes the row divided instead into an array of vertical lines
    // each nested line divided by columns
    for (let i = 0; i < minRowHeight; i++) {
      linedRow[i].push((typeof cell[i] !== "undefined")
        ? cell[i] : whitespace)
    }
  })

  return linedRow
}

export const buildCell = (config: any, elem: any, columnIndex: number, rowType: string, rowIndex: number | null, rowData: any[], inputData: any[], dryRun = false) => {
  let cellValue: any = null

  const cellOptions: any = Object.assign(
    { reset: false },
    config,
    (rowType !== "header") ? config.columnSettings[columnIndex] : {},
    (typeof elem === "object") ? elem : {}
  )

  if (rowType === "header") {
    config.table.columns.push(cellOptions)
    cellValue = cellOptions.alias || cellOptions.value || ""
  } else {
    // set cellValue
    switch (true) {
      case (typeof elem === "undefined" || elem === null):
        // replace undefined/null elem values with placeholder
        cellValue = (config.errorOnNull) ? config.defaultErrorValue : config.defaultValue
        if (!isColorEnabled()) {
          cellValue = stripAnsi(cellValue)
        }
        // @TODO add to elem defaults
        cellOptions.isNull = true
        break

      case (typeof elem === "object" && elem !== null && typeof elem.value !== "undefined"):
        cellValue = elem.value
        break

      case (typeof elem === "function"):
        cellValue = (elem as Function).bind({
          configure: function (object: any) {
            return Object.assign(cellOptions, object)
          },
          style: style,
          resetStyle: resetStyle
        })(
          cellValue,
          columnIndex,
          rowIndex,
          rowData,
          inputData
        )
        break

      default:
        // elem is assumed to be a scalar
        cellValue = elem
    }

    // run formatter
    if (rowType === "body" && typeof cellOptions.formatter === "function") {
      cellValue = cellOptions.formatter
        .bind({
          configure: function (object: any) {
            return Object.assign(cellOptions, object)
          },
          style: style,
          resetStyle: resetStyle
        })(
          cellValue,
          columnIndex,
          rowIndex,
          rowData,
          inputData
        )
    }

    if (dryRun) {
      return cellValue
    }
  }

  // colorize cellValue
  // we don't want the formatter to pass a styled cell value with ANSI codes
  // (in case user wants to do math or string operations to cell value), so
  // we apply default styles to the cell after it runs through the formatter
  // and omit those default styles if the user applied `this.resetStyle`
  if (!cellOptions.reset) {
    cellValue = colorizeCell(cellValue, cellOptions, rowType)
  }

  // textwrap cellValue
  const { cell, innerWidth } = wrapCellText(cellOptions, cellValue, columnIndex, cellOptions, rowType)

  if (rowType === "header") {
    config.table.columnInnerWidths.push(innerWidth)
  }

  return cell
}

/**
 * Check for a backwards compatible (cli-table) constructor
 */
export const getConstructorGeometry = (row: any, config: any) => {
  let type: string

  // rows passed as an object
  if (typeof row === "object" && !(row instanceof Array)) {
    const keys = Object.keys(row)

    if (config.adapter === "automattic") {
      // detected cross table
      const key = keys[0]!

      if (row[key] instanceof Array) {
        type = "automattic-cross"
      } else {
        // detected vertical table
        type = "automattic-vertical"
      }
    } else {
      // detected horizontal table
      type = "o-horizontal"
    }
  } else {
    // rows passed as an array
    type = "a-horizontal"
  }

  return type
}

/**
 * Coerce backwards compatible constructor styles
 */
export const coerceConstructorGeometry = (config: any, rows: any[], constructorType: string) => {
  let output: any[] = []
  switch (constructorType) {
    case ("automattic-cross"):
      // assign header styles to first column
      config.columnSettings[0] = config.columnSettings[0] || {}
      config.columnSettings[0].color = config.headerColor

      output = rows.map((obj: any) => {
        const arr: any[] = []
        const key = Object.keys(obj)[0]!
        arr.push(key)
        return arr.concat(obj[key])
      })
      break

    case ("automattic-vertical"):
      // assign header styles to first column
      config.columnSettings[0] = config.columnSettings[0] || {}
      config.columnSettings[0].color = config.headerColor

      output = rows.map(function (value: any) {
        const key = Object.keys(value)[0]!
        return [key, value[key]]
      })
      break

    case ("o-horizontal"):
      // cell property names are specified in header columns
      if (config.table.header[0].length
        && config.table.header[0].every((obj: any) => obj.value)) {
        output = rows.map((row: any) => config.table.header[0]
          .map((obj: any) => row[obj.value]))
      } // eslint-disable-line brace-style
      // no property names given, default to object property order
      else {
        output = rows.map((obj: any) => Object.values(obj))
      }
      break

    case ("a-horizontal"):
      output = rows
      break

    default:
  }

  return output
}

// @TODO For rotating horizontal data into a vertical table
// assumes all rows are same length
// export const verticalizeMatrix = (config, inputArray) => {
//
//   // grow to # arrays equal to number of columns in input array
//   let outputArray = []
//   let headers = config.table.columns
//
//   // create a row for each heading, and prepend the row
//   // with the heading name
//   headers.forEach(name => outputArray.push([name]))
//
//   inputArray.forEach(row => {
//     row.forEach((element, index) => outputArray[index].push(element))
//   })
// }
