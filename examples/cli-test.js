require("../test/example-header.js")()
const cp = require("child_process")
const pwd = __dirname

const output1 = cp.execSync(`cat ${pwd}/data/data.csv | node ${pwd}/../adapters/terminal-adapter.js`, {
  encoding: "utf8"
})
console.log(output1)

const output2 = cp.execSync(`cat ${pwd}/data/data.json | node ${pwd}/../adapters/terminal-adapter.js --format json`, {
  encoding: "utf8"
})
console.log(output2)
