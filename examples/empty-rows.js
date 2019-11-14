const Table = require("../")

const header = [
  { value: "col1" },
  { value: "col2" }
]

const rows = []

const header2 = [
  { value: "col1" },
  { value: "col2" },
  { value: "col3" }
]

const rows2 = []

let a = Table(header2, rows2)
console.log(a.render())

let b = Table(header, rows)
console.log(b.render())
