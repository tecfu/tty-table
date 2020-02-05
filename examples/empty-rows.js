const Table = require("../")

const header = [
  { value: "col1" },
  { value: "col2" },
  { value: "col3" }
]
const rows = []
let t = Table(header, rows)
console.log(t.render())
