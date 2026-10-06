import { colorizeCell, isColorEnabled, style, resetStyle } from "./style"
import { wrapCellText, getColumnWidths } from "./format"
import stripAnsi from "strip-ansi"

// Column widths are measured once per table: measuring is the expensive half of
// rendering, and a stream of prints has to keep one geometry. The memo used to be
// `global.columnWidths`, keyed by `config.tableId` - an integer that counts tables
// inside one copy of this module. Load two copies into one process (a bundler that
// inlined tty-table next to a hoisted one, a monorepo with two versions, a test
// runner that resets modules but not globals) and the counters collide: the second
// copy's tables render with the first copy's widths. Entries were never removed
// either, so every table that was ever built stayed in the heap.
const measuredWidths = new WeakMap<object, number[]>()

// Tables rendered through a terminal adapter do not increment the counter, which is
// how successive prints of a stream were meant to share widths - a property of the
// stream, not of the process, so it gets a slot of its own. Keying it by the shared
// id meant an adapter table inherited the widths of whichever ordinary table
// happened to have been created last.
let adapterWidths: number[] | undefined

export const stringifyData = (config: any, inputData: any[]) => {
  const sections: any = { header: [], body: [], footer: [] }
  const marginLeft = " ".repeat(config.marginLeft)
  const borderStyle = config.borderCharacters[config.borderStyle]
  const borders: any[] = []

  const constructorType = getConstructorGeometry(inputData[0] || [], config)
  const rows = coerceConstructorGeometry(config, inputData, constructorType)

  // Both are rebuilt from the header cells during this render (see buildCell).
  // Nothing resets them, so a table that is rendered repeatedly - a status line,
  // a stream that redraws on every tick - kept every previous render's entries:
  // one object per column per render, held for the life of the table.
  config.table.columns = []
  config.table.columnInnerWidths = []

  // When the column widths are not already cached, every body cell is built
  // twice on a table's first render: once dry, to measure the columns, and once
  // to print them. Cell functions and formatters are caller code, so the dry
  // pass ran them for real - twice the side effects, and, for anything that is
  // not a pure function of its arguments, geometry taken from the first call
  // and text from the second. This memo keeps the value a cell produced, and
  // the options it asked for through configure(), with the cell. It lives for
  // the duration of one render.
  //
  // Phase semantics, deliberately: cell code now executes during the
  // MEASUREMENT pass, and the render pass reuses what it returned. Previously
  // it executed in both, so a callback that consulted external state could
  // act on the render-time state; it now sees the evaluation-time state. This
  // is a semantic change, not just deduplication - see the PR notes.
  const cellMemo = new Map<CellMemoKey, CellMemo>()

  const isStream = config.terminalAdapter === true
  const cached = isStream ? adapterWidths : (config.table ? measuredWidths.get(config.table) : undefined)

  if (cached) {
    config.table.columnWidths = cached
  } else {
    const formattedRows = rows.map((row: any[], rowIndex: number) => {
      return row.map((cell: any, cellIndex: number) => buildCell(config, cell, cellIndex, "body", rowIndex, rows, inputData, true, cellMemo))
    })
    const widths = getColumnWidths(config, formattedRows)

    if (isStream) adapterWidths = widths
    else if (config.table) measuredWidths.set(config.table, widths)

    config.table.columnWidths = widths
  }

  switch (true) {
    case (config.showHeader !== null && !config.showHeader):
      sections.header = []
      break
    case (config.showHeader === true):
    case (!!config.table.header[0].find((obj: any) => obj.value || obj.alias)):
      sections.header = config.table.header.map((row: any[]) => buildRow(config, row, "header", null, rows, inputData, cellMemo))
      break
    default:
      sections.header = []
  }

  sections.body = rows.map((row: any[], rowIndex: number) => buildRow(config, row, "body", rowIndex, rows, inputData, cellMemo))
  sections.footer = (config.table.footer instanceof Array && config.table.footer.length > 0) ? [config.table.footer] : []
  sections.footer = sections.footer.map((row: any[]) => buildRow(config, row, "footer", null, rows, inputData, cellMemo))

  for (let a = 0; a < 3; a++) {
    borders[a] = borderStyle[a].l
    config.table.columnWidths.forEach((columnWidth: number, index: number, arr: number[]) => {
      borders[a] += borderStyle[a].h.repeat(Math.max(columnWidth, 2) - 1)
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

export const buildRow = (config: any, row: any[], rowType: RowType, rowIndex: number | null, rowData: any[], inputData: any[], cellMemo?: Map<CellMemoKey, CellMemo>) => {
  let minRowHeight = 0
  if (row.length === 0 && config.compact) {
    (row as any).empty = true
    return row
  }

  const lengthDifference = config.table.columnWidths.length - row.length
  if (lengthDifference > 0) row = row.concat(new Array(lengthDifference).fill(null))
  else if (lengthDifference < 0) row.length = config.table.columnWidths.length

  row = row.map((elem: any, elemIndex: number) => {
    const cell = buildCell(config, elem, elemIndex, rowType, rowIndex, rowData, inputData, false, cellMemo)
    minRowHeight = (minRowHeight < cell.length) ? cell.length : minRowHeight
    return cell
  })

  minRowHeight = (rowType === "header") ? minRowHeight : minRowHeight + (config.paddingBottom + config.paddingTop)
  const linedRow: any[] = Array.from({ length: minRowHeight }, () => [])

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

/**
 * Merged options for one column (or for the header row), built once per table
 * config and shared by every cell in that column through the prototype chain.
 *
 * buildCell used to run `Object.assign({}, config, columnSettings[i], elem)` for
 * every single cell, copying ~45 config keys each time: that was 57% of the
 * self-time when rendering a 50x2000 cell table. The merge is now paid once per
 * column instead of once per cell. Inherited values are still read correctly,
 * and every write (configure(), the centering padding equalisation, isNull)
 * becomes an own property of the cell and never leaks back into the base.
 */
const optionBases: WeakMap<object, { header: any, body: any[] }> = new WeakMap()

const getOptionBase = (config: any, columnIndex: number, rowType: string) => {
  let bases = optionBases.get(config)

  if (!bases) {
    bases = { header: null, body: [] }
    optionBases.set(config, bases)
  }

  if (rowType === "header") {
    return bases.header ??= Object.assign({ reset: false }, config)
  }

  return bases.body[columnIndex] ??= Object.assign(
    { reset: false },
    config,
    config.columnSettings[columnIndex] || {}
  )
}

export interface CellMemo {
  value: any
  configured: Record<string, unknown>
  isNull: boolean
}

// The three row kinds buildCell distinguishes; the factory accepts no others.
export type RowType = "header" | "body" | "footer"

// A memo entry is addressed by the cell's position in the render structure.
// header and footer rows build once (dryRun never touches them) and always
// carry rowIndex null, body rows carry their real index, so the triple is
// unique per cell within one render - no two cells can serialise to the same
// key.
export type CellMemoKey = `${RowType}:${number | null}:${number}`

export const buildCell = (config: any, elem: any, columnIndex: number, rowType: RowType, rowIndex: number | null, rowData: any[], inputData: any[], dryRun = false, cellMemo?: Map<CellMemoKey, CellMemo>) => {
  let cellValue: any = null
  const base = getOptionBase(config, columnIndex, rowType)
  const cellOptions: any = (typeof elem === "object" && elem !== null)
    ? Object.assign(Object.create(base), elem)
    : Object.create(base)

  // What the cell asked for through this.configure(), kept so the second pass
  // sees the same options without running the cell a second time.
  const configured: Record<string, unknown> = {}
  const configure = (object: any) => {
    Object.assign(cellOptions, object)
    Object.assign(configured, object)
    return cellOptions
  }

  const memoKey: CellMemoKey = `${rowType}:${rowIndex}:${columnIndex}`
  const seen = cellMemo?.get(memoKey)

  if (rowType === "header") {
    config.table.columns.push(cellOptions)
    cellValue = cellOptions.alias || cellOptions.value || ""
  } else if (seen) {
    Object.assign(cellOptions, seen.configured)
    if (seen.isNull) cellOptions.isNull = true
    cellValue = seen.value
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
      case (typeof elem === "function"): {
        const cellFunction = elem as (this: any, value: any, columnIndex: number, rowIndex: number | null, rowData: any[], inputData: any[]) => any
        cellValue = cellFunction.bind({
          configure,
          style: style,
          resetStyle: resetStyle
        })(cellValue, columnIndex, rowIndex, rowData, inputData)
        break
      }
      default:
        cellValue = elem
    }

    if (rowType === "body" && typeof cellOptions.formatter === "function") {
      cellValue = cellOptions.formatter.bind({
        configure,
        style: style,
        resetStyle: resetStyle
      })(cellValue, columnIndex, rowIndex, rowData, inputData)
    }

    cellMemo?.set(memoKey, { value: cellValue, configured, isNull: cellOptions.isNull === true })

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
