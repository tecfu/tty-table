require("../test/example-header.js")()
const Table = require("../")
const Chalk = require("chalk")

const header = [
  {
    value: "item",
    formatter: value => Chalk.cyan(value)
  },
  { value: "price" },
  { value: "organic" }
]

const options = {
  borderStyle: 1,
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
  ["special sauce", 0.10],
  [null, 1.50, "no", "extra element", "another extra element"],
  ["macaroni and cheese", 3.75, "no"]
]

// Example with objects as rows
const rows2 = [
  {},
  {
    item: "special sauce",
    price: 0.10
  },
  {
    item: null,
    price: 1.50,
    organic: "no"
  },
  {
    item: "macaroni and cheese",
    price: 3.75,
    organic: "no"
  }
]


const footer = [
  "TOTAL",
  (cellValue, columnIndex, rowIndex, rowData) => {
    return rowData.reduce((prev, curr) => {
      return (curr[1]) ? prev + curr[1] : prev
    }, 0)
  },
  "N/A"
]

let t1 = Table(header, rows, footer, options)
let t2 = Table(header, rows2, footer, options)

t1.push(
  ["chocolate cake", 4.65, "no"]
)
t2.push(
  { item: "chocolate cake", price: 4.65, organic: "no" }
)

console.log(t1.render())
console.log(t2.render())
