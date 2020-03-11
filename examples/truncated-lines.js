require("../test/example-utils.js").quickInit()
const Table = require("../")

const header = [
  {
    value: "item name",
    formatter: function (value) {
      return this.style(value, "cyan")
    },
    width: 10
  },
  {
    value: "price",
    width: 10
  },
  {
    value: "100% organic",
    width: 10
  }
]

const options = {
  borderStyle: "solid",
  paddingBottom: 0,
  headerAlign: "center",
  align: "center",
  color: "green",
  truncate: "..."
}

// test truncation with elipsis
const t1 = Table(header, [], options)
t1.push(
  ["chocolate cake", 4.65, "no"]
)
const str1 = t1.render()
console.log(str1)

// test truncation with long value
const t2 = Table(header, [], options)
t2.push(
  ["pound cake", 123456789123456789, "no"]
)
const str2 = t2.render()
console.log(str2)

// test with padding
const options3 = Object.assign({}, options)
options3.paddingLeft = 2
options3.paddingRight = 2
const t3 = Table(header, [], options3)
t3.push(
  ["pound cake", 123456789123456789, "no"]
)
const str3 = t3.render()
console.log(str3)

// test truncation with boolean false
const options4 = Object.assign({}, options)
options4.truncate = false
const t4 = Table(header, [], options4)
t4.push(
  ["chocolate cake", 4.65, "no"]
)
const str4 = t4.render()
console.log(str4)

// test truncation with boolean true
const options5 = Object.assign({}, options)
options5.truncate = true
const t5 = Table(header, [], options5)
t5.push(
  ["chocolate cake", 5.65, "no"]
)
const str5 = t5.render()
console.log(str5)

// test with asian characters
const t6 = Table([
  { width: 5 }, { width: 4 }, { width: 5 }
], [], {
  truncate: "...",
  paddingLeft: 0,
  paddingRight: 0
})

t6.push(
  ["特制的酱汁", 0.10],
  ["2玉米饼, 大米和豆类, 奶酪", 9.80, ""],
  ["苹果片", 1.00, "yes"]
)

const str6 = t6.render()
console.log(str6)

// customize truncation in individual cell
const header7 = [
  {
    value: "item name",
    formatter: function (cellValue, columnIndex, rowIndex) {
      if (rowIndex === 1) {
        this.configure({
          truncate: false,
          align: "right"
        })
      }
      return cellValue
    },
    width: 10
  }
]

const options7 = {
  headerAlign: "center",
  align: "center",
  truncate: "..."
}

const t7 = Table(header7, [], options7)

t7.push(
  ["chocolate cake"],
  ["jewish coffee cake"],
  ["birthday cake"],
  ["-"]
)

const str7 = t7.render()
console.log(str7)
