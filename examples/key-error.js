require("../test/example-utils.js").quickInit()
const Table = require("../")
const chalk = require("chalk")

const makeRed = function (val) {
  if (val === "") {
    return this.style("?", "white", "bgRed")
  }
  return val
}

const header = [
  { value: "Name", formatter: makeRed },
  { value: "Email", formatter: makeRed },
  { value: "Note" }
]

const data = [
  { Name: "Jane", Email: "jane@fake.com", Note: "All keys correct" },
  { XName: "Joel", XEmail: "joel@fake.com", Note: "Misspelled keys XName and XEmail" },
  { Name: "Mike", Email: "mike@fake.com", Note: "All keys correct" }
]

// With color
console.log(Table(header, data).render())

// Without color
console.log("\nCI=1:\n")
chalk.level = 0
const noColorTable = Table(header, data)
console.log(noColorTable.render())
