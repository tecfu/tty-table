require("../test/example-utils.js").quickInit()
const Table = require("../")

// No empty space where horizontal border would be
const rows = [
  ["xxxyyyzzz", "aaaaa", "bbbbbb", "11111111"],
  ["zzzxxxyyy", "bbbbbb", "cccccc", "2222222"]
]
const t = Table(rows, {
  borderStyle: "none",
  compact: true,
  align: "left",
  color: "white",
  marginTop: 0,
  marginLeft: 0
})
console.log(t.render())
