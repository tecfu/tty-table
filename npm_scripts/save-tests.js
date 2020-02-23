const fs = require("fs")
const glob = require("glob")
const cp = require("child_process")
const pkg = require("../package.json")
const savedTestDir = `${__dirname}/../test/saved_test_outputs`

// get list of all example scripts
const all = glob.sync("examples/*.js")
const exclude = glob.sync("examples/example-*.js")
const list = all.filter(p => !exclude.includes(p))

list.forEach( element => {
  // exports process.stdout.columns 
  const stdout = cp.execSync(`node ./${element} --color=always`, {
    encoding: "utf8",
    env: { ...process.env, "COLUMNS": pkg.defaultTestColumns } // since child process wont inherit process.stdout.columns
  })

  const subname = element.split("/").pop().split(".")[0]
  const filename = `${subname}-output.txt`
  const filepath = `${savedTestDir}/${filename}`

  console.log(stdout)
  fs.writeFileSync(filepath, stdout)
  console.log(`Wrote output to text file: ${filepath}\n`)
})
