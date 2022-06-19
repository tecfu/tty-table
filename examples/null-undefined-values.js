require("../test/example-utils.js").quickInit()
const Table = require("../")

const header = [
  {
    value: "item",
    formatter: function (value) {
      return this.style(value, "cyan")
    }
  },
  { value: "price" },
  { value: "organic" }
]

const options = {
  borderStyle: "solid",
  paddingBottom: 0,
  headerAlign: "center",
  align: "center",
  color: "green",
  footerColor: "yellow",
  footerAlign: "right"
}

// Example with arrays as rows
const rows = [
  [],
  ["special sauce", 0.10, "yes"],
  [null, 1.50, "no", "extra element", "another extra element"],
  ["macaroni and cheese", 3.75],
  [0, 0, 0]
]

// Example with objects as rows
const rows2 = [
  {},
  {
    item: "special sauce",
    price: 0.10,
    organic: "yes"
  },
  {
    item: null,
    price: 1.50,
    organic: "no"
  },
  {
    item: "macaroni and cheese",
    price: 3.75
  },
  {
    item: 0,
    price: 0,
    organic: 0
  }
]

const footer = [
  "TOTAL",
  (cellValue, columnIndex, rowIndex, rowData) => {
    return rowData.reduce((prev, curr) => {
      return (curr[1]) ? prev + curr[1] : prev
    }, 0).toFixed(2)
  },
  function (cellValue, columnIndex, rowIndex, rowData) {
    const total = rowData.reduce((prev, curr) => {
      return prev + ((curr[2] === "yes") ? 1 : 0)
    }, 0)
    return `${(total / rowData.length * 100).toFixed(2)}%`
  }
]

const t1 = Table(header, rows, footer, options)
const t2 = Table(header, rows2, footer, options)

t1.push(
  ["chocolate cake", 4.65, "no"]
)
t2.push(
  { item: "chocolate cake", price: 4.65, organic: "no" }
)

console.log(t1.render())
console.log(t2.render())
