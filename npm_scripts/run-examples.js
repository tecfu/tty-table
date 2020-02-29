const fs = require("fs")
const glob = require("glob")
const cp = require("child_process")
const pkg = require("../package.json")
const savedTestDir = `${__dirname}/../test/saved_test_outputs`

const mode = (process.argv[2] && process.argv[2]) ? process.argv[2] : "view"


// get list of all example scripts
const all = glob.sync("examples/*.js")

// files not to test
const testExclude = glob.sync("examples/example-*.js").map(path => path.split("/").pop())

// files not to show as examples
const viewExclude = [
  "auto-resize-percentage-widths.js",
  "auto-resize-undeclared-widths.js",
  "example-script.js"
]
debugger
const exclude = (mode === "test") ? testExclude : viewExclude
const list = all.filter(file => !exclude.includes(file.split("/").pop()))

list.forEach( filepath => {
  // exports process.stdout.columns 
  const stdout = cp.execSync(`node ./${filepath} --color=always`, {
    encoding: "utf8",
    env: { ...process.env, "COLUMNS": pkg.defaultTestColumns } // since child process wont inherit process.stdout.columns
  })

  const subname = filepath.split("/").pop().split(".")[0]
  const filename = `${subname}-output.txt`
  const savepath = `${savedTestDir}/${filename}`

  console.log(stdout)

  if (mode === "save") {
    fs.writeFileSync(savepath, stdout)
    console.log(`Wrote output to text file: ${savepath}\n`)
  }
})
