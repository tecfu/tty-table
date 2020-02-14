require("../test/example-header.js")()
const Table = require("../")

const rows = [[`The use of the cli-table is deprecated.
Migrate over -> cli-table. Run:
npm un cli-table -g
npm i tty-table -g`]]

const t1 = Table([], rows, {
  borderStyle: "solid",
  borderColor: "yellow",
  paddingBottom: 0,
  headerAlign: "center",
  headerColor: "yellow",
  align: "center",
  color: "white"
})

const str1 = t1.render()
console.log(str1)
