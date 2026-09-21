require("../test/example-utils.js").quickInit()
const Table = require("../")

const header = [
  {
    value: "Test",
    align: "left",
    headerAlign: "left",
    footerAlign: "right"
  },
  {
    value: "Score",
    align: "left",
    headerAlign: "left",
    footerAlign: "left",
    formatter: function (cellValue) {
      if (typeof cellValue !== "number") return cellValue
      return this.style(String(cellValue), cellValue > 60 ? "green" : "red")
    }
  }
]
const rows = [
  ["Performance", 64],
  ["Accessibility", 70],
  ["Best Practices", 30],
  ["SEO", 60],
  ["PWA", 100]
]
const footer = [
  "Total",
  function (cellValue, columnIndex, rowIndex, rowData) {
    const total = Math.round(rowData.map((i) => i[1]).reduce((p, c) => p + c) / 5)
    return this.style(String(total), "italic")
  }
]
const renderedTable = Table(header, rows, footer).render()
console.log(renderedTable)
