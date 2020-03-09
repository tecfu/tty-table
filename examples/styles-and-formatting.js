require("../test/example-utils.js").quickInit()
const Table = require("../")

const header = [
  {
    value: "item",
    headerColor: "cyan",
    color: "white",
    align: "left",
    width: "20%"
  },
  {
    value: "description",
    width: "40%",
    headerColor: "magenta",
    color: "yellow"
  },
  {
    value: "peru_price",
    alias: "peru",
    color: "red",
    width: "15%",
    formatter: function (value) {
      const str = `$${value.toFixed(2)}`
      return (value > 5) ? this.style(str, "green", "bold")
        : this.style(str, "red", "bold")
    }
  },
  {
    value: "us_price",
    alias: "usa",
    color: "red",
    width: "15%",
    formatter: function (value) {
      const str = `$${value.toFixed(2)}`
      return (value > 5) ? this.style(str, "green", "bold")
        : this.style(str, "red", "underline")
    }
  },
  {
    alias: "vegan",
    value: "organic",
    align: "right",
    width: "10%",
    formatter: function (value) {
      if (value === "yes") {
        value = this.style(value, "bgGreen", "black")
      } else {
        value = this.style(value, "bgRed", "white")
      }
      return value
    }
  }
]

// Example with objects as rows
const rows = [
  {
    item: "tallarin verde",
    description: "Peruvian version of spaghetti with pesto. Includes a thin piece of fried chicken breast",
    peru_price: 2.50,
    us_price: 15.50,
    organic: "no"
  },
  {
    item: "aji de gallina",
    description: "Heavy aji cream sauce, rice, and chicken with a halved hard-boiled egg",
    peru_price: 1.80,
    us_price: 14.50,
    organic: "no"
  }
]

// Example with arrays as rows
const rows2 = [
  ["tallarin verde", 2.50, 15.50, "no"],
  ["aji de gallina", 1.80, 14.50, "no"]
].map((arr, index) => {
  arr.splice(1, 0, rows[index].description); return arr
})

const footer = [
  "TOTAL",
  "",
  function (cellValue, columnIndex, rowIndex, rowData) {
    const total = rowData.reduce((prev, curr) => {
      return prev + curr[2]
    }, 0)
      .toFixed(2)
    return this.style(`$${total}`, "italic")
  },
  function (cellValue, columnIndex, rowIndex, rowData) {
    const total = rowData.reduce((prev, curr) => {
      return prev + curr[3]
    }, 0)
      .toFixed(2)
    return this.style(`$${total}`, "italic")
  },
  function (cellValue, columnIndex, rowIndex, rowData) {
    const total = rowData.reduce((prev, curr) => {
      return prev + ((curr[4] === "yes") ? 1 : 0)
    }, 0)
    return `${(total / rowData.length * 100).toFixed(2)}%`
  }
]

const options = {
  borderStyle: "solid",
  borderColor: "green",
  paddingBottom: 0,
  headerAlign: "center",
  headerColor: "green",
  align: "center",
  color: "white",
  width: "80%"
}

const t1 = Table(header, rows, footer, options).render()
console.log(t1)

const t2 = Table(header, rows2, footer, options).render()
console.log(t2)

const header3 = [
  {
    value: "price",
    formatter: function (cellValue, columnIndex, rowIndex, rowData, inputData) {
      const row = inputData[rowIndex] // How to get the whole row
      let _color

      if (!row.enabled) _color = "gray"
      if (row.important) _color = "red"

      return this.style(cellValue, _color)
    }
  },
  {
    value: "item",
    color: "underline",
    formatter: function (cellValue) {
      return (/banana/.test(cellValue)) ? this.resetStyle(cellValue) : cellValue
    }
  }
]

const rows3 = [
  {
    price: 1.99,
    item: "[32m[37m[41m banana[49m[32m[39m",
    important: true,
    enabled: true
  },
  {
    price: 2.99,
    item: "[32m[37m[41m grapes[49m[32m[39m",
    important: false,
    enabled: false
  }
]

const t3 = Table(header3, rows3, { width: 50, borderStyle: "none", compact: true }).render()
console.log(t3)

const t4 = Table(header3, rows3, { width: 50, paddingTop: 2, paddingBottom: 2 }).render()
console.log(t4)

header3[0].alias = header3[0].value
header3[1].alias = header3[1].value

delete header3[0].value
delete header3[1].value

const t5 = Table(header3, rows3, { width: 50, paddingTop: 2, paddingBottom: 2 }).render()
console.log(t5)

delete header3[0].alias
delete header3[1].alias

// will have a different column width because no header to derive from
const t6 = Table(header3, rows3, { width: 50, paddingTop: 2, paddingBottom: 2 }).render()
console.log(t6)
