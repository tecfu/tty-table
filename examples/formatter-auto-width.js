require("../test/example-utils.js").quickInit()
const Table = require("../")

const header = [
  {
    value: "price",
    formatter: function (value) {
      return `${value} USD`
    }
  }
]

const rows = [
  [1],
  [10],
  [100]
]

const t1 = Table(header, rows)
console.log(t1.render())
