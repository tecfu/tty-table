require("../test/example-header.js")(25, true)
const Table = require("../")

let output = new Table([[
  "aaa bbb ccc",
  "aaa bbb ccc 😀😃😄😁 eee fff ggg hhh",
  "aaa bbb ccc ddd eee fff ggg hhh iii jjj kkk lll mmm nnn ooo ppp qqq rrr sss ttt"
]], {
  paddingLeft: 0,
  paddingRight: 0,
  marginTop: 0
}).render()

console.log(output)
