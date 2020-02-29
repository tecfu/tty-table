require("../test/example-utils.js").quickInit(25, true)
const Table = require("../")

/**
 * In this example the wide characters in the first column are replaced
 * with a placeholder when the column widths are inferred.
 */
const rows = [[
  "aaa bbb ccc",
  "aaa bbb ccc ddd eee fff ggg hhh",
  "aaa bbb ccc ddd eee fff ggg hhh iii jjj kkk lll mmm nnn ooo ppp qqq rrr sss ttt"
], [
  "汉堡包",
  "特制的酱汁",
  "2玉米饼, 大米和豆类, 大米和豆类, 大米和豆类, 奶酪"
]]

const output1 = new Table(rows, {
  marginLeft: 0,
  paddingLeft: 0,
  paddingRight: 0,
  marginTop: 0
}).render()

console.log(output1)
