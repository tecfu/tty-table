require("../test/example-utils.js").quickInit()
const Table = require("../")

const header = [
  { value: "col1" },
  { value: "col2" }
]
const rows = [[10001, 20002]]

const header2 = [
  { value: "col1" },
  { value: "col2" },
  { value: "col3" }
]
const rows2 = [
  [1, 2, 3],
  [3, 34, 99]
]

const t1 = Table(header, rows)
const t2 = Table(header2, rows2)
console.log(t2.render())
console.log(t1.render())
