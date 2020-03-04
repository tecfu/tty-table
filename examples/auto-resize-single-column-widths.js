const example = require("../test/example-utils.js")
const Table = require("../")

const baseConfig = {
  marginLeft: 0,
  marginTop: 0
}
const defaultSampleText = "this is a test"

const program = require("commander").description("example test script")
  .option("-c, --columns <number>", "list number/ranges to test. ie 1-25 or 10", "1-25")
  .option("-t, --text <string>", "sample text", defaultSampleText)
  .option("--color", "to support chalk meta argument")
  .parse(process.argv)

function testColumns (cols, sampleText, overrideConfig) {
  const config = Object.assign({}, baseConfig, overrideConfig || {})
  const rows = [[]]

  for (let i = 0; i < cols; i++) {
    rows[0].push(sampleText)
  }

  const table = new Table(rows, config)
  const output = table.render()

  example.init(`Test ${cols} columns`, (cols * 2) + 1) // need to account for border
  console.log(output)
}

for (const cols of example.parseNumericList(program.columns)) {
  for (const text of example.parseList(program.text)) {
    testColumns(cols, text)
  }
}
