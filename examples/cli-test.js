require("../test/example-utils.js").quickInit()
const pkg = require("../package.json")
const cp = require("child_process")
const pwd = __dirname

const output1 = cp.execSync(`cat ${pwd}/data/data.csv | node ${pwd}/../adapters/terminal-adapter.js`, {
  encoding: "utf8",
  env: { ...process.env, COLUMNS: pkg.defaultTestColumns } // since child process wont inherit process.stdout.columns
})
console.log(output1)

const output2 = cp.execSync(`cat ${pwd}/data/data.json | node ${pwd}/../adapters/terminal-adapter.js --format json`, {
  encoding: "utf8",
  env: { ...process.env, COLUMNS: pkg.defaultTestColumns } // since child process wont inherit process.stdout.columns
})
console.log(output2)

const output3 = cp.execSync(`cat ${pwd}/data/data-wide.csv | node ${pwd}/../adapters/terminal-adapter.js --options-width 20`, {
  encoding: "utf8",
  env: { ...process.env, COLUMNS: pkg.defaultTestColumns } // since child process wont inherit process.stdout.columns
})
console.log(output3)
