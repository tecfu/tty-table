const Table = require("../")

const header = [
  {
    value: "item"
  }
]

// Example with arrays as rows
const rows1 = [
  [1]
]

const rows2 = [
  [{ value: 1 }]
]

const footer = [
  function (cellValue, columnIndex, rowIndex, rowData) {
    const total = rowData.reduce((prev, curr) => {
      return prev + (typeof curr[0] === "object") ? curr[0].value : curr[0]
    }, 0)
    return `${(total / rowData.length * 100).toFixed(2)}%`
  }
]

const options = {
  borderColor: "green",
  width: "80%"
}

// header, rows, footer, and options
const A1 = Table(header, rows1, footer, options).render()
const A2 = Table(header, rows2, footer, options).render()

// header, rows, footer
const B1 = Table(header, rows1, footer).render()
const B2 = Table(header, rows2, footer).render()

// header, rows, options
const C1 = Table(header, rows1, options).render()
const C2 = Table(header, rows2, options).render()

// header, rows            (rows, footer is not an option)
const D1 = Table(header, rows1).render()
const D2 = Table(header, rows2).render()

// rows, options
const E1 = Table(rows1, options).render()
const E2 = Table(rows2, options).render()

// rows
const F1 = Table(rows1).render()
const F2 = Table(rows2).render()

// adapter called: i.e. `require('tty-table')('automattic-cli')`

console.log(A1, A2, B1, B2, C1, C2, D1, D2, E1, E2, F1, F2)
