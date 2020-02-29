require("../test/example-utils.js").quickInit()
const Table = require("../")

const headerA = [
  { value: "column 1", width: 20 }, { width: 10 }, { width: 30 }
]

const headerB = [
  { width: 20 }, { width: 10 }, { width: 30 }
]

const rows = [
  ["e", "pluribus", "unum"]
]

const out = []

out.push(Table(headerA, rows, {}).render()) // show automatically
out.push(Table(headerA, rows, { showHeader: true }).render()) // show
out.push(Table(headerA, rows, { showHeader: false }).render()) // hide

out.push(Table(headerB, rows, {}).render()) // hide automatically
out.push(Table(headerB, rows, { showHeader: true }).render()) // show
out.push(Table(headerB, rows, { showHeader: false }).render()) // hide

console.log(out.join("\n"))
