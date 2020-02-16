require("../test/example-utils.js").quickInit()
const Table = require("../")

const header = [
  { value: "col1" },
  { value: "col2" },
  { value: "col3" }
]
const rows = []
const t = Table(header, rows)
console.log(t.render())
