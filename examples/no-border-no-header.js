const Table = require("../")

//Example with arrays as rows
const rows = [
  ["xxxyyyzzz"],
  ["zzzxxxyyy"]
]

const t1 = Table(rows,{
  borderStyle: "none",
  marginTop: 0,
  marginLeft: 0,
  align: "left",
  color: "white"
})

console.log(t1.render())


//Example with arrays as rows
const rows2 = [
  ["xxxyyyzzz"],
  ["zzzxxxyyy"]
]

const t2 = Table(rows2,{
  borderStyle: "none",
  compact: true,
  marginTop: 0,
  marginLeft: 0,
  align: "left",
  color: "white"
})

console.log(t2.render())


//Another example with arrays as rows
const rows3 = [
  ["xxxyyyzzz", "aaaaa"],
  ["zzzxxxyyy", "bbbbbb"]
]

const t3 = Table(rows3,{
  borderStyle: "none",
  compact: true,
  align: "left",
  color: "white",
  marginTop: 0,
  marginLeft: 0
})

console.log(t3.render())
