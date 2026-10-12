const example = require("../test/example-utils.js")
const Table = require("../")

const baseRows = [[
  "aaa bbb ccc",
  "aaa bbb ccc ddd eee fff ggg hhh"
]]

const baseHeaders = [
  { alias: "Fixed header", width: "25%" },
  { alias: "Auto header" }
]

example.init("Test non divisible column width", 100)
const t1 = Table(baseHeaders, baseRows)

console.log(t1.render())
example.dumpMessages()
