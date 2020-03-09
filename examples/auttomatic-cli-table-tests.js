require("../test/example-utils.js").quickInit()
const Table = require("../")("automattic-cli-table")

/* col widths */
const t1 = new Table({
  head: ["Rel", "Change", "By", "When"],
  colWidths: [6, 21, 25, 17]
})
t1.push(
  ["v0.1", "Testing something cool", "rauchg@gmail.com", "7 minutes ago"]
  , ["v0.1", "Testing something cool", "rauchg@gmail.com", "8 minutes ago"]
)
console.log(t1.toString())

/* compact */
const t2 = new Table({
  head: ["Rel", "Change", "By", "When"],
  colWidths: [6, 21, 25, 17],
  style: { compact: true, "padding-left": 1 }
})
t2.push(
  ["v0.1", "Testing something cool", "rauchg@gmail.com", "7 minutes ago"]
  , ["v0.1", "Testing something cool", "rauchg@gmail.com", "8 minutes ago"]
  , []
  , ["v0.1", "Testing something cool", "rauchg@gmail.com", "8 minutes ago"]
)
console.log(t2.toString())

/* headless */
var headlessTable = new Table()
headlessTable.push(["v0.1", "Testing something cool", "rauchg@gmail.com", "7 minutes ago"])
console.log(headlessTable.toString())

/* vertical */
var verticalTable = new Table({
  style: {
    head: ["green"]
  }
})
verticalTable.push({ "Some Key": "Some Value" },
  { "Another much longer key": "And its corresponding longer value" }
)
console.log(verticalTable.toString())

/* cross */
var crossTable = new Table({ head: ["", "Header #1", "Header #2"] })
crossTable.push({ "Header #3": ["Value 1", "Value 2"] },
  { "Header #4": ["Value 3", "Value 4"] })
console.log(crossTable.toString())

/* additional to improve code coverage */
const misc = new Table({
  head: ["Rel", "Change", "By", "When"],
  colWidths: [6, 21, 25, 17],
  colAligns: ["left", "left", "right", "right"],
  style: { compact: true, "padding-right": 1, body: ["green"] }
})
misc.push(
  ["v0.1", "Testing something cool", "rauchg@gmail.com", "7 minutes ago"]
  , ["v0.1", "Testing something cool", "rauchg@gmail.com", "8 minutes ago"]
  , []
  , ["v0.1", "Testing something cool", "rauchg@gmail.com", "8 minutes ago"]
)
console.log(misc.toString())
