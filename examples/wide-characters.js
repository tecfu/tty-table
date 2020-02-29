require("../test/example-utils.js").quickInit()
const Table = require("../")

const header = [
  { value: "项目" },
  { value: "价格" },
  { value: "有机" }
]
const rows = [
  ["汉堡包", 2.50, null],
  ["特制的酱汁", 0.10],
  ["2玉米饼, 大米和豆类, 奶酪", 9.80, ""],
  ["苹果片", 1.00, "yes"],
  [null, 1.50, "no"],
  ["意大利粉, 火腿, 意大利干酪", 3.75, "no"]
]
const t1 = Table(header, rows, {
  borderStyle: "solid",
  headerAlign: "right",
  align: "center",
  color: "white"
})
console.log(t1.render())

const rows2 = [
  ["abc"],
  ["abć"],
  ["ab한"]
]
const t2 = Table(header, rows2, {
  borderStyle: "dashed",
  paddingBottom: 0,
  paddingLeft: 2,
  paddingRight: 2,
  headerAlign: "right",
  align: "center",
  color: "white"
})
console.log(t2.render())
