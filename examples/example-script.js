const example = require("../test/example-utils.js"),
  Table = require("../")

const baseConfig = {
    marginLeft: 0,
    marginTop: 0
  },
  defaultSampleText = "this is a test"

const program = require("commander").description("example test script")
  .option("-c, --columns <number>", "list number/ranges to test", "1-5,10")
  .option("-t, --text <string>", "sample text", defaultSampleText)
  .option("--color", "to support chalk meta argument")
  .parse(process.argv)

function testColumns(cols, sampleText, overrideConfig) {
  let config = Object.assign({}, baseConfig, overrideConfig || {}),
    rows = [[]]

  for (let i = 0; i < cols; i++) {
    rows[0].push(sampleText)
  }

  let table = new Table(rows, config),
    output = table.render()

  example.init(`Test ${cols} columns`)
  console.log(output)
}


for (let cols of example.parseNumericList(program.columns)) {
  for (let text of example.parseList(program.text)) {
    testColumns(cols, text)
  }
}

