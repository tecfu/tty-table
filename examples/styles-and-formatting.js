require("../test/example-utils.js").quickInit()
const Table = require("../")

let header = [
  {
    value: "item",
    headerColor: "cyan",
    color: "white",
    align: "left",
    width: 20
  },
  {
    value: "price",
    color: "red",
    width: 10,
    formatter: function (value) {
      let str = `$${value.toFixed(2)}`
      return (value > 5) ? this.style(str, "green", "bold") :
        this.style(str, "red", "underline")
    }
  },
  {
    alias: "is organic?",
    value: "organic",
    align: "right",
    width: 15,
    formatter: function (value) {
      if(value === "yes") {
        value = this.style(value, "bgGreen", "black")
      } else{
        value = this.style(value, "bgRed", "white")
      }
      return value
    }
  }
]

// Example with arrays as rows
const rows = [
  ["tallarin verde", 5.50, "yes"],
  ["aji de gallina", 4.50, "no"],
]

// Example with objects as rows
const rows2 = [
  {
    item: "tallarin verde",
    price: 5.50,
    organic: "yes"
  },
  {
    item: "aji de gallina",
    price: 4.50,
    organic: "no"
  }
]


const footer = [
  "TOTAL",
  function (cellValue, columnIndex, rowIndex, rowData) {
    let total = rowData.reduce((prev, curr) => {
      return prev + curr[1]
    }, 0)
      .toFixed(2)

    return this.style(`$${total}`, "italic")
  },
  function (cellValue, columnIndex, rowIndex, rowData) {
    let total = rowData.reduce((prev, curr) => {
      return prev + ((curr[2] === "yes") ? 1 : 0)
    }, 0)
    return `${ (total / rowData.length * 100).toFixed(2) }%`
  }
]

const options = {
  borderStyle: "solid",
  borderColor: "green",
  paddingBottom: 0,
  headerAlign: "center",
  align: "center",
  color: "white",
  truncate: "..."
}

let t1 = Table(header, rows, footer, options).render()
console.log(t1)

const t2 = Table(header, rows2, footer, options).render()
console.log(t2)



const header3 = [
  {
    value: "price",
    formatter: function (cellValue, columnIndex, rowIndex, rowData, inputData) {
      const row = inputData[rowIndex] // How to get the whole row
      let _color

      if(!row.enabled) _color = "gray"
      if(row.important) _color = "red"

      return this.style(cellValue, _color)
    }
  },
  {
    value: "item"
  }
]

const rows3 = [
  { item: "banana", price: 1.99, important: true, enabled: true },
  { item: "grapes", price: 2.99, important: false, enabled: false }
]

const t3 = Table(header3, rows3)
console.log(t3.render())
