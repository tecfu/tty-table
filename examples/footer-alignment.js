require("../test/example-utils.js").quickInit()
const Table = require("../")
const { green, red, italic } = require("kleur")

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
    formatter: (cellValue) => {
      if (typeof cellValue !== "number") return cellValue
      return cellValue > 60 ? green(cellValue) : red(cellValue)
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
  (cellValue, columnIndex, rowIndex, rowData) => {
    const total = Math.round(rowData.map((i) => i[1]).reduce((p, c) => p + c) / 5)
    return italic(total)
  }
]
const renderedTable = Table(header, rows, footer).render()
console.log(renderedTable)
