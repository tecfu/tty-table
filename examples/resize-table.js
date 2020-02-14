require("../test/example-header.js")()
const Table = require("../")
const Chalk = require("chalk")

let failures = []

function test (width, truncate, marginLeft) {
  let output = new Table([
    {minWidth: 6, shrink: 0},
    {minWidth: 12, shrink: 1},
    {minWidth: 24, shrink: 1000}
  ], [[
    "aaa bbb ccc",
    "aaa bbb ccc ddd eee fff ggg hhh",
    "aaa bbb ccc ddd eee fff ggg hhh iii jjj kkk lll mmm nnn ooo ppp qqq rrr sss ttt"
  ]], {
    truncate: false,
    paddingLeft: 0,
    paddingRight: 0,
    marginTop: 0,
    marginLeft: typeof marginLeft === "number" ? marginLeft : 2
  }).render()

  let widest = Math.max(...output.split("\n").map(s => s.length))

  if (widest > width) {
    failures.unshift(`Table Too Wide: target=${width} widest-line=${widest}`)
    console.log(Chalk.red(failures[0]))
  }
  console.log(output)
}

for (let w = 25; w < 120; w++) {
  console.log(`\n${`=== width=${w} ${new Array(w).fill("=").join("")}`.substr(0, w - 1)  }|`)
  process.stdout.columns = w  // fake width
  let leftMargin = /^\d+$/.test(process.argv[3]) ? parseInt(process.argv[3]) : 2
  test(w, process.argv[2], leftMargin)
}

//let w = 64
//console.log(`\n${`=== width=${w} ${new Array(w).fill("=").join("")}`.substr(0, w - 1)  }|`)
//process.stdout.columns = w  // fake width
//test(w, false, 3)

if (failures.length) {
  process.stderr.write(Chalk.redBright(failures.join("\n")))
}
