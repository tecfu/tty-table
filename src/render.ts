import { colorizeCell, isColorEnabled, style, resetStyle } from "./style"
import { wrapCellText, getColumnWidths } from "./format"
import stripAnsi from "strip-ansi"

export const stringifyData = (config: any, inputData: any[]) => {
  const sections: any = { header: [], body: [], footer: [] }
  const marginLeft = " ".repeat(config.marginLeft)
  const borderStyle = config.borderCharacters[config.borderStyle]
  const borders: any[] = []

  const constructorType = getConstructorGeometry(inputData[0] || [], config)
  const rows = coerceConstructorGeometry(config, inputData, constructorType)

  if (!(global as any).columnWidths) (global as any).columnWidths = {}

  if ((global as any).columnWidths[config.tableId]) {
    config.table.columnWidths = (global as any).columnWidths[config.tableId]
  } else {
    const formattedRows = rows.map((row: any[], rowIndex: number) => {
      return row.map((cell: any, cellIndex: number) => buildCell(config, cell, cellIndex, "body", rowIndex, rows, inputData, true))
    })
    ;(global as any).columnWidths[config.tableId] = config.table.columnWidths = getColumnWidths(config, formattedRows)
  }

  switch (true) {
    case (config.showHeader !== null && !config.showHeader):
      sections.header = []
      break
    case (config.showHeader === true):
    case (!!config.table.header[0].find((obj: any) => obj.value || obj.alias)):
      sections.header = config.table.header.map((row: any[]) => buildRow(config, row, "header", null, rows, inputData))
      break
    default:
      sections.header = []
  }

  sections.body = rows.map((row: any[], rowIndex: number) => buildRow(config, row, "body", rowIndex, rows, inputData))
  sections.footer = (config.table.footer instanceof Array && config.table.footer.length > 0) ? [config.table.footer] : []
  sections.footer = sections.footer.map((row: any[]) => buildRow(config, row, "footer", null, rows, inputData))

  for (let a = 0; a < 3; a++) {
    borders[a] = borderStyle[a].l
    config.table.columnWidths.forEach((columnWidth: number, index: number, arr: number[]) => {
      borders[a] += " ".repeat(Math.max(columnWidth, 2) - 1)
      borders[a] += ((index + 1 < arr.length) ? borderStyle[a].j : "")
    })
    borders[a] += borderStyle[a].r
    borders[a] = (a < 2) ? `${marginLeft + borders[a]}\n` : marginLeft + borders[a]
  }

  const output: string[] = [borders[0]]

  for (const [sectionIndex, sectionName] of Object.keys(sections).entries()) {
    const section = sections[sectionName]

    for (let rowIndex = 0; rowIndex < section.length; rowIndex++) {
      const row = section[rowIndex]
      row.forEach((line: string[]) => {
        output.push(marginLeft + borderStyle[1].v + line.join(borderStyle[1].v) + borderStyle[1].v + "\n")
      })

      switch (true) {
        case (rowIndex === section.length - 1 && sectionIndex === 1 && sections.footer.length === 0):
          break
        case (rowIndex === section.length - 1 && sectionIndex === 2):
          break
        case (config.compact && sectionName === "body" && !row.empty):
          break
        case (config.borderStyle === "none" && config.compact):
          break
        default:
          output.push(borders[1])
      }
    }
  }

  output.push(borders[2])
  const finalOutput = "\n".repeat(config.marginTop) + output.join("")
  config.height = finalOutput.split(/\r\n|\r|\n/).length
  return finalOutput
}

export const buildRow = (config: any, row: any[], rowType: string, rowIndex: number | null, rowData: any[], inputData: any[]) => {
  let minRowHeight = 0
  if (row.length === 0 && config.compact) {
    (row as any).empty = true
    return row
  }

  const lengthDifference = config.table.columnWidths.length - row.length
  if (lengthDifference > 0) row = row.concat(Array.apply(null, new Array(lengthDifference)).map(() => null))
  else if (lengthDifference < 0) row.length = config.table.columnWidths.length

  row = row.map((elem: any, elemIndex: number) => {
    const cell = buildCell(config, elem, elemIndex, rowType, rowIndex, rowData, inputData)
    minRowHeight = (minRowHeight < cell.length) ? cell.length : minRowHeight
    return cell
  })

  minRowHeight = (rowType === "header") ? minRowHeight : minRowHeight + (config.paddingBottom + config.paddingTop)
  const linedRow: any[] = Array.apply(null, { length: minRowHeight } as any).map(Function.call, () => [])

  row.forEach(function (cell: string[], a: number) {
    const whitespace = " ".repeat(Math.max(config.table.columnWidths[a] - 1, 0))
    if (rowType === "body") {
      for (let i = 0; i < config.paddingTop; i++) cell.unshift(whitespace)
      for (let i = 0; i < config.paddingBottom; i++) cell.push(whitespace)
    }
    for (let i = 0; i < minRowHeight; i++) linedRow[i].push((typeof cell[i] !== "undefined") ? cell[i] : whitespace)
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
    switch (true) {
      case (typeof elem === "undefined" || elem === null):
        cellValue = (config.errorOnNull) ? config.defaultErrorValue : config.defaultValue
        if (!isColorEnabled()) cellValue = stripAnsi(cellValue)
        cellOptions.isNull = true
        break
      case (typeof elem === "object" && elem !== null && typeof elem.value !== "undefined"):
        cellValue = elem.value
        break
      case (typeof elem === "function"):
        cellValue = (elem as Function).bind({
          configure: function (object: any) { return Object.assign(cellOptions, object) },
          style: style,
          resetStyle: resetStyle
        })(cellValue, columnIndex, rowIndex, rowData, inputData)
        break
      default:
        cellValue = elem
    }

    if (rowType === "body" && typeof cellOptions.formatter === "function") {
      cellValue = cellOptions.formatter.bind({
        configure: function (object: any) { return Object.assign(cellOptions, object) },
        style: style,
        resetStyle: resetStyle
      })(cellValue, columnIndex, rowIndex, rowData, inputData)
    }

    if (dryRun) return cellValue
  }

  if (!cellOptions.reset) cellValue = colorizeCell(cellValue, cellOptions, rowType)
  const { cell, innerWidth } = wrapCellText(cellOptions, cellValue, columnIndex, cellOptions, rowType)
  if (rowType === "header") config.table.columnInnerWidths.push(innerWidth)
  return cell
}

export const getConstructorGeometry = (row: any, config: any) => {
  let type: string
  if (typeof row === "object" && !(row instanceof Array)) {
    const keys = Object.keys(row)
    if (config.adapter === "automattic") {
      const key = keys[0]!
      type = row[key] instanceof Array ? "automattic-cross" : "automattic-vertical"
    } else type = "o-horizontal"
  } else type = "a-horizontal"
  return type
}

export const coerceConstructorGeometry = (config: any, rows: any[], constructorType: string) => {
  let output: any[] = []
  switch (constructorType) {
    case "automattic-cross":
      config.columnSettings[0] = config.columnSettings[0] || {}
      config.columnSettings[0].color = config.headerColor
      output = rows.map((obj: any) => {
        const key = Object.keys(obj)[0]!
        return [key].concat(obj[key])
      })
      break
    case "automattic-vertical":
      config.columnSettings[0] = config.columnSettings[0] || {}
      config.columnSettings[0].color = config.headerColor
      output = rows.map((value: any) => {
        const key = Object.keys(value)[0]!
        return [key, value[key]]
      })
      break
    case "o-horizontal":
      if (config.table.header[0].length && config.table.header[0].every((obj: any) => obj.value)) {
        output = rows.map((row: any) => config.table.header[0].map((obj: any) => row[obj.value]))
      } else output = rows.map((obj: any) => Object.values(obj))
      break
    case "a-horizontal":
      output = rows
      break
  }
  return output
}
