#!/usr/bin/env node
const path = require("path")
const fs = require("fs")
const csv = require("csv")
const ttytable = require("../dist/index.js")
const style = ttytable.style
let yargs = require("yargs")

yargs.epilog("Copyright github.com/tecfu 2018")

yargs.option("config", {
  describe: "Alias of --header: path to a JSON array of header cells."
})

yargs.option("csv-delimiter", {
  describe: "Set the field delimiter. One character only.",
  default: ","
})

yargs.option("csv-escape", {
  describe: "Set the escape character. One character only."
})

yargs.option("csv-rowDelimiter", {
  describe: "String used to delimit record rows. You can also use a special constant: \"auto\",\"unix\",\"max\",\"windows\",\"unicode\".",
  default: "\n"
})

yargs.option("format", {
  describe: "Set input data format",
  choices: ["json", "csv"],
  default: "csv"
})

yargs.option("options\u2010\u002A", {
  describe: "Specify an optional setting where * is the setting name. See README.md for a complete list."
})

// run help only at the end
yargs = yargs.help("h").argv

const emitError = function (type, detail) {
  console.log(`
${style(type, "white", "bgRed")}

${detail}`)
  process.exit(1)
}

// note that this is the first run
let alreadyRendered = false
let previousHeight = 0

let dataFormat = "csv"
switch (true) {
  case (typeof yargs.format === "undefined"):
    break
  case (yargs.format.toString().match(/json/i) !== null):
    dataFormat = "json"
    break
  default:
}

// look for individually flagged options-*
const options = {}
Object.keys(yargs).forEach(function (key) {
  const keyParts = key.split("-")
  if (keyParts[0] === "options") {
    options[keyParts[1]] = yargs[key]
  }
})

// look for options passed via config file (--config is the spelling used by
// dist/cli.js; the flag this adapter grew first was --header)
let header = []
const headerFile = yargs.header || yargs.config
if (headerFile) {
  if (!fs.existsSync(path.resolve(headerFile))) {
    emitError(
      "Invalid file path",
      `Cannot find config file at: ${headerFile}.`
    )
  }
  try {
    // merge with any individually flagged options
    header = require(path.resolve(headerFile))
  } catch (error) {
    emitError(
      "Configuration error",
      `Could not read the header configuration at ${headerFile}: ${error.message}`
    )
  }
}

// What the renderer can turn into a table: an array with at least one row, where a
// row is an array of cells or an object keyed by the header names. Without this
// check an empty stream or a flat JSON array died inside the renderer with a
// TypeError and a stack trace.
const validateRows = function (data) {
  if (typeof data === "undefined" || data === null) {
    emitError(
      "No input",
      "Nothing was piped to stdin. Try: cat data.csv | tty-table, or --format json with a JSON array of rows."
    )
  }

  if (!Array.isArray(data)) {
    emitError(
      "Input error",
      "Expected an array of rows, got " +
      (typeof data === "object" ? "an object" : "`" + String(data) + "`") +
      ". Rows are arrays of cells, e.g. [[1, 2], [3, 4]], or objects keyed by the header names."
    )
  }

  if (data.length === 0) {
    emitError(
      "No input",
      "The input was empty, so there is nothing to render."
    )
  }

  const badRow = data.findIndex(function (row) {
    return !(Array.isArray(row) || (typeof row === "object" && row !== null))
  })

  if (badRow !== -1) {
    emitError(
      "Input error",
      "Row " + badRow + " is `" + JSON.stringify(data[badRow]) + "`. Rows must be " +
      "arrays of cells or objects keyed by the header names."
    )
  }

  return data
}

// because different dataFormats
const runTable = function (header, body) {
  // footer = [],
  const Table = ttytable
  options.terminalAdapter = true
  const t1 = Table(header, body, options)

  // hide cursor
  console.log("\u001b[?25l")

  // wipe existing if already rendered
  if (alreadyRendered) {
    // move cursor up number to the top of the previous print
    // before deleting
    console.log(`\u001b[${previousHeight + 3}A`)

    // delete to end of terminal
    console.log("\u001b[0J")
  } else {
    alreadyRendered = true
  }

  console.log(t1.render())

  // reset the previous height to the height of this output
  // for when we next clear the print
  previousHeight = t1.height
}

const chunks = []
process.stdin.resume()
process.stdin.setEncoding("utf8")

// JSON remains buffered because a JSON array is not safely row-streamable without
// changing the accepted input format. CSV, however, is record-oriented, so pipe
// stdin directly through the parser and render each record as it arrives.
if (dataFormat === "json") {
  process.stdin.on("data", function (chunk) {
    chunks.push(chunk)
  })
  process.stdin.on("end", function () {
    const stdin = chunks.join("")
    let data
    try {
      data = JSON.parse(stdin)
    } catch {
      emitError(
        "JSON parse error",
        "Please check to make sure that your input data consists of valid JSON or specify a different format with the --format flag."
      )
    }
    runTable(header, validateRows(data))
  })
} else {
  const formatterOptions = {}
  Object.keys(yargs).forEach(function (key) {
    if (key.slice(0, 4) === "csv-" && typeof (yargs[key]) !== "undefined") {
      formatterOptions[key.slice(4)] = yargs[key]
    }
  })

  const csvParser = csv.parse(formatterOptions)
  const rows = []
  csvParser.on("data", function (row) {
    if (process.stdout.isTTY) {
      runTable(header, validateRows([row]))
    } else {
      rows.push(row)
    }
  })
  csvParser.on("error", function () {
    emitError(
      "CSV parse error",
      "Please check to make sure that your input data consists of valid comma separated values or specify a different format with the --format flag."
    )
  })
  csvParser.on("end", function () {
    if (rows.length === 0 && !process.stdout.isTTY) {
      emitError(
        "No input",
        "Nothing was piped to stdin. Try: cat data.csv | tty-table."
      )
    }
    if (!process.stdout.isTTY) {
      runTable(header, validateRows(rows))
    }
  })

  process.stdin.pipe(csvParser)
}

/* istanbul ignore next */
if (process.platform === "win32") {
  const rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.on("SIGINT", function () {
    process.emit("SIGINT")
  })
}

/* istanbul ignore next */
process.on("SIGINT", function () {
  // graceful shutdown
  process.exit()
})

process.on("exit", function () {
  // Only an interactive terminal has a cursor to restore.
  if (process.stdout.isTTY) console.log("\u001b[?25h")
})
